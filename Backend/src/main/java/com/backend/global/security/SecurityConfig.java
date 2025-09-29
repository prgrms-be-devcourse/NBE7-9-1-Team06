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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // 1) 공개 리소스 먼저!
                        .requestMatchers("/favicon.ico", "/h2-console/**", "/swagger-ui/**",
                                "/login", "/css/**", "/js/**").permitAll()

                        // 2) 공개 API (순서 중요!)
                        .requestMatchers(HttpMethod.GET,  "/api/v1/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/v1/orders/**").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/v1/admin/orders/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/orders").permitAll()
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/orders/**").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/orders/**").permitAll()

                        // 3) 관리자 전용 (나중에!)
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // 4) 나머지는 인증 필요
                        .anyRequest().authenticated()
                )
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.addHeaderWriter(
                        new XFrameOptionsHeaderWriter(XFrameOptionsHeaderWriter.XFrameOptionsMode.SAMEORIGIN)))
                .formLogin(form -> form
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
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, ex0) -> {
                            if (req.getRequestURI().startsWith("/admin")) {
                                res.sendRedirect("/login");
                            } else {
                                ErrorCode ec = ErrorCode.ACCESS_TOKEN_NOT_FOUND;
                                res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                res.setStatus(ec.getStatus().value());
                                res.getWriter().write("""
                            {"resultCode":"%d","msg":"%s"}
                        """.formatted(ec.getCode(), ec.getMessage()));
                            }
                        })
                        .accessDeniedHandler((req, res, ex1) -> {
                            if (req.getRequestURI().startsWith("/admin")) {
                                res.sendRedirect("/login");
                            } else {
                                ErrorCode ec = ErrorCode.ACCESS_TOKEN_INVALID;
                                res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                res.setStatus(ec.getStatus().value());
                                res.getWriter().write("""
                            {"resultCode":"%d","msg":"%s"}
                        """.formatted(ec.getCode(), ec.getMessage()));
                            }
                        })
                );

        // ✅ 빠져있던 반환!
        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("https://cdpn.io", "http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 필요에 따라 "/**"로 넓혀도 됨
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}