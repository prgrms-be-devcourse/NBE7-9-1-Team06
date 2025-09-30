package com.backend.global.security;

import com.backend.domain.admin.auth.entity.Admin;
import com.backend.domain.admin.auth.service.AdminAuthService;
import com.backend.domain.admin.auth.service.AuthTokenService;
import com.backend.global.exception.ServiceException;
import com.backend.global.exception.ErrorCode;
import com.backend.global.rq.Rq;
import com.backend.global.rsData.RsData;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

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
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {

    String uri = request.getRequestURI();
    String method = request.getMethod();

    // 디버깅용 로그
    System.out.println("CustomAuthenticationFilter - URI: " + uri + ", Method: " + method);

    // 1) 보호 경로만 인증 강제 (예: 관리자 전용)
    boolean isProtected =
            (uri.startsWith("/api/v1/admin/") && !uri.startsWith("/api/v1/admin/orders") && !uri.startsWith("/api/v1/admin/products")) ||  // 관리자 API (주문/상품 제외)
            uri.startsWith("/admin/");           // Thymeleaf 관리자 페이지

    System.out.println("CustomAuthenticationFilter - isProtected: " + isProtected);

    // 보호 경로가 아니면 그대로 통과(permitAll 경로 포함)
    if (!isProtected) {
        System.out.println("CustomAuthenticationFilter - 허용된 경로, 통과");
        chain.doFilter(request, response);
        return;
    }



    // 2) 보호 경로라면 토큰을 읽어서 있으면 검증, 없으면 401
    String token = rq.getHeader("Authorization", "");
    if (token.startsWith("Bearer ")) token = token.substring(7);
    if (token.isBlank()) token = rq.getCookieValue("accessToken", "");

    if (token.isBlank()) { // 🔴 기존: 모든 경로에서 401 → 변경: 보호 경로에서만 401
        throw new ServiceException(ErrorCode.ACCESS_TOKEN_NOT_FOUND);
    }

    Map<String, Object> payload = authTokenService.getPayloadOrNull(token);
    if (payload == null || !payload.containsKey("username") || !payload.containsKey("role")) {
        throw new ServiceException(ErrorCode.ACCESS_TOKEN_INVALID);
    }

    // ...인증 컨텍스트 설정 그대로...
    chain.doFilter(request, response);
}

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        // ✅ Thymeleaf/정적리소스 등은 필터 제외
        return !uri.startsWith("/api/");
    }

    private void authenticate(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 0) 세션(폼 로그인) 인증이 이미 있으면 통과
        Authentication existing = SecurityContextHolder.getContext().getAuthentication();
        if (existing != null && existing.isAuthenticated() && !"anonymousUser".equals(existing.getPrincipal())) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1) 토큰 추출 (헤더 → 쿠키)
        String token = rq.getHeader("Authorization", "");
        if (token.startsWith("Bearer ")) token = token.substring(7);
        if (token.isBlank()) token = rq.getCookieValue("accessToken", "");

        // 2) 토큰이 **없으면** 여기서 끝! (예외 던지지 않음)
        filterChain.doFilter(request, response);
        if (true) return; // 가독성용, 아래는 '토큰 있을 때'만 실행

        // 3) 토큰이 **있을 때만** 검증하고 컨텍스트 세팅 (잘못된 토큰만 401)
        // (위 return을 제거하고 아래 코드 활성화하세요)
    /*
    if (token.isBlank()) {
        filterChain.doFilter(request, response);
        return;
    }

    Map<String, Object> payload = authTokenService.getPayloadOrNull(token);
    if (payload == null || !payload.containsKey("username") || !payload.containsKey("role")) {
        throw new ServiceException(ErrorCode.ACCESS_TOKEN_INVALID);
    }

    String username = (String) payload.get("username");
    String role = (String) payload.get("role");

    Admin admin = adminAuthService.findByUsername(username)
            .orElseThrow(() -> new ServiceException(ErrorCode.USER_NOT_FOUND));

    UserDetails user = new SecurityUser(
            admin.getId(),
            admin.getUsername(),
            admin.getPassword(),
            List.of(new SimpleGrantedAuthority(role))
    );

    Authentication authentication = new UsernamePasswordAuthenticationToken(
            user, user.getPassword(), user.getAuthorities()
    );
    SecurityContextHolder.getContext().setAuthentication(authentication);
    filterChain.doFilter(request, response);
    */
    }
}
