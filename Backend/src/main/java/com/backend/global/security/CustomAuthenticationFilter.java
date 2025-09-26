package com.backend.global.security;

import com.backend.domain.admin.auth.entity.Admin;
import com.backend.domain.admin.auth.service.AdminAuthService;
import com.backend.domain.admin.auth.service.AuthTokenService;
import com.backend.global.exception.ServiceException;
import com.backend.global.rq.Rq;
import com.backend.global.rsData.RsData;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationFilter extends OncePerRequestFilter {

    private final AdminAuthService adminAuthService;
    private final AuthTokenService authTokenService;
    private final Rq rq;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        logger.debug("CustomAuthenticationFilter called");

        try {
            authenticate(request, response, filterChain);
        } catch (ServiceException e) {
            RsData rsData = e.getRsData();
            response.setContentType("application/json");
            response.setStatus(rsData.getStatusCode());
            response.getWriter().write("""
                    {
                        "resultCode": "%s",
                        "msg": "%s"
                    }
                    """.formatted(rsData.getResultCode(), rsData.getMsg()));
        } catch (Exception e) {
            throw e;
        }
    }

    private void authenticate(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        // 인증이 필요 없는 API 경로 설정
        if (uri.startsWith("/h2-console") ||
                uri.startsWith("/swagger-ui") ||
                uri.equals("/api/v1/admin/login") || // 경로 수정
                (method.equals("GET") && uri.startsWith("/api/v1/products")) ||
                (method.equals("GET") && uri.startsWith("/api/v1/orders")) ||
                (method.equals("POST") && uri.equals("/api/v1/orders"))
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        // Authorization 헤더에서 토큰 추출
        String token = rq.getHeader("Authorization", "");
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // 헤더에 토큰이 없으면 쿠키에서 추출
        if (token.isBlank()) {
            token = rq.getCookieValue("accessToken", "");
        }

        // 토큰이 없으면 인증 실패
        if (token.isBlank()) {
            throw new ServiceException("401-1", "액세스 토큰이 없습니다.");
        }

        Map<String, Object> payload = authTokenService.getPayloadOrNull(token);
        if (payload == null || !payload.containsKey("username") || !payload.containsKey("role")) {
            throw new ServiceException("401-3", "액세스 토큰이 유효하지 않습니다.");
        }

        String username = (String) payload.get("username");
        String role = (String) payload.get("role");

        Admin admin = adminAuthService.findByUsername(username)
                .orElseThrow(() -> new ServiceException("401-4", "사용자 정보를 찾을 수 없습니다."));

        UserDetails user = new SecurityUser(
                admin.getId(),
                admin.getUsername(),
                admin.getPassword(),
                List.of(new SimpleGrantedAuthority(role))
        );

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user,
                user.getPassword(),
                user.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        filterChain.doFilter(request, response);
    }
}
