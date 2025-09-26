package com.backend.global.security;

import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.frameoptions.XFrameOptionsHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomAuthenticationFilter customAuthenticationFilter;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorizeHttpRequests) -> authorizeHttpRequests
                        .requestMatchers("/h2-console/**").permitAll() // H2 콘솔 접근 허용
                        .requestMatchers("/swagger-ui/**").permitAll() // Swagger 접근 허용
                        .requestMatchers("/api/v1/admin/login").permitAll() // 관리자 로그인 API 허용
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll() // 상품 조회 API 허용
                        .requestMatchers(HttpMethod.POST, "/api/v1/orders").permitAll() // 주문 생성 API 허용
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN") // 관리자 API만 ROLE_ADMIN 권한 필요
                        .anyRequest().authenticated()) // 그 외 모든 요청은 인증 필요
                .csrf((csrf) -> csrf.disable())
                .headers((headers) -> headers
                        .addHeaderWriter(new XFrameOptionsHeaderWriter(
                                XFrameOptionsHeaderWriter.XFrameOptionsMode.SAMEORIGIN)))
                .addFilterBefore(customAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(
                        exceptionHandling -> exceptionHandling
                                .authenticationEntryPoint((request, response, authenticationException) -> {
                                    response.setContentType("application/json");
                                    response.setStatus(401);
                                    response.setCharacterEncoding("UTF-8");
                                    response.getWriter().write(
                                            """
                                                        {
                                                            "resultCode": "401-1",
                                                            "msg": "로그인 후 이용해주세요."
                                                        }
                                                    """);
                                })
                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                    response.setContentType("application/json");
                                    String accessToken = request.getHeader("Authorization");
                                    if (accessToken == null) accessToken = "";

                                    if (accessToken.isBlank()) {
                                        if (request.getCookies() != null) {
                                            for (Cookie cookie : request.getCookies()) {
                                                if ("accessToken".equals(cookie.getName())) {
                                                    accessToken = cookie.getValue();
                                                    break;
                                                }
                                            }
                                        }
                                    }

                                    response.setStatus(403);
                                    response.setCharacterEncoding("UTF-8");
                                    response.getWriter().write(
                                            """
                                                        {
                                                            "resultCode": "403-1",
                                                            "msg": "권한이 없습니다."
                                                        }
                                                    """);
                                }
                                ));
        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration =new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("https://cdpn.io", "http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}