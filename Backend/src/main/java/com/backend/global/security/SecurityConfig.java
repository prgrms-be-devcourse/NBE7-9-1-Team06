package com.backend.global.security;

import com.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
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
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorizeHttpRequests) -> authorizeHttpRequests
                        .requestMatchers("/favicon.ico").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/login").permitAll()
                        .requestMatchers("/css/**", "/js/**").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/products/**",
                                "/api/v1/orders/**",
                                "/api/v1/admin/orders/**",
                                "/api/v1/admin/products/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/login", "/api/v1/orders").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/**").authenticated()
                        .anyRequest().authenticated())
                .csrf((csrf) -> csrf.disable())
                .headers((headers) -> headers
                        .addHeaderWriter(new XFrameOptionsHeaderWriter(
                                XFrameOptionsHeaderWriter.XFrameOptionsMode.SAMEORIGIN)))
                .formLogin(formLogin -> formLogin
                        .loginPage("/login")
                        .defaultSuccessUrl("/admin/dashboard", true)
                        .failureUrl("/login?error=true")
                        .permitAll())
                .userDetailsService(customUserDetailsService)
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login")
                        .invalidateHttpSession(true)
                        .deleteCookies("accessToken")
                        .permitAll())
                .addFilterBefore(customAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(
                        exceptionHandling -> exceptionHandling
                                .authenticationEntryPoint((request, response, authenticationException) -> {
                                    // Thymeleaf 페이지 요청인 경우 로그인 페이지로 리다이렉트
                                    if (request.getRequestURI().startsWith("/admin")) {
                                        response.sendRedirect("/login");
                                        return;
                                    }
                                    // API 요청인 경우 JSON 응답
                                    ErrorCode errorCode = ErrorCode.ACCESS_TOKEN_NOT_FOUND;
                                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                    response.setStatus(errorCode.getStatus().value());
                                    response.getWriter().write(
                                            """
                                                {
                                                    \"resultCode\": \"%d\",
                                                    \"msg\": \"%s\"
                                                }
                                            """.formatted(errorCode.getCode(), errorCode.getMessage()));
                                })
                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                    // Thymeleaf 페이지 요청인 경우 로그인 페이지로 리다이렉트
                                    if (request.getRequestURI().startsWith("/admin")) {
                                        response.sendRedirect("/login");
                                        return;
                                    }
                                    // API 요청인 경우 JSON 응답
                                    ErrorCode errorCode = ErrorCode.ACCESS_TOKEN_INVALID;
                                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                    response.setStatus(errorCode.getStatus().value());
                                    response.getWriter().write(
                                            """
                                                {
                                                    \"resultCode\": \"%d\",
                                                    \"msg\": \"%s\"
                                                }
                                            """.formatted(errorCode.getCode(), errorCode.getMessage()));
                                })
                );

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("https://cdpn.io", "http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }

}