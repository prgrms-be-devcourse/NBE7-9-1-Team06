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

        // 인증이 필요 없는 API 경로 설정
        if (uri.startsWith("/api/v1/products") ||
                uri.startsWith("/api/v1/orders") ||
                uri.startsWith("/swagger-ui") ||
                uri.equals("/api/v1/admin/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        String accessToken = rq.getHeader("Authorization", "");
        if (accessToken.isBlank()) {
            accessToken = rq.getCookieValue("accessToken", "");
        }

        if (accessToken.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwtToken = accessToken.replaceFirst("Bearer ", "");

        Map<String, Object> payload = authTokenService.getPayloadOrNull(jwtToken);

        if (payload == null) {
            throw new ServiceException("401-3", "액세스 토큰이 유효하지 않습니다.");
        }

        String username = (String) payload.get("username");
        String role = (String) payload.get("role");

        // Admin 엔티티를 조회하거나 SecurityUser 객체를 생성하여 인증
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

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}
