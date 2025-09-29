package com.backend.domain.admin.controller;

import com.backend.domain.admin.auth.entity.Admin;
import com.backend.domain.admin.auth.service.AdminAuthService;
import com.backend.global.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class AdminViewController {

    private final AdminAuthService adminAuthService;

    @GetMapping("/login")
    public String login(@RequestParam(value = "error", required = false) String error, Model model) {
        if ("true".equals(error)) {
            model.addAttribute("error", "아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        return "login";
    }

    @GetMapping("/admin/dashboard")
    public String dashboard(Model model) {
        Admin admin = getCurrentAdmin();
        if (admin != null) {
            model.addAttribute("admin", admin);
        }
        return "admin/dashboard";
    }

    @GetMapping("/admin/products")
    public String products(Model model) {
        Admin admin = getCurrentAdmin();
        if (admin != null) {
            model.addAttribute("admin", admin);
        }
        return "admin/products";
    }

    @GetMapping("/admin/orders")
    public String orders(Model model) {
        Admin admin = getCurrentAdmin();
        if (admin != null) {
            model.addAttribute("admin", admin);
        }
        return "admin/orders";
    }

    private Admin getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getPrincipal()) &&
            authentication.getPrincipal() instanceof SecurityUser) {
            
            SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
            return adminAuthService.findByUsername(securityUser.getUsername()).orElse(null);
        }
        return null;
    }
}
