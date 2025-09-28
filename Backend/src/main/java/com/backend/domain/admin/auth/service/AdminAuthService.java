package com.backend.domain.admin.auth.service;

import com.backend.domain.admin.auth.entity.Admin;
import com.backend.domain.admin.auth.repository.AdminAuthRepository;
import com.backend.global.exception.ServiceException;
import com.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAuthService {

    private final AdminAuthRepository adminAuthRepository;
    private final PasswordEncoder passwordEncoder;

    public void checkPassword(String inputPassword, String rawPassword) {
        if(!passwordEncoder.matches(inputPassword, rawPassword)) {
            throw new ServiceException(ErrorCode.PASSWORD_NOT_MATCH);
        }
    }

    public Admin join(String username, String password) {

        adminAuthRepository.findByUsername(username)
                .ifPresent(m -> {
                    throw new ServiceException(ErrorCode.ALREADY_USED_USERNAME);
                });

        Admin member = new Admin(username, passwordEncoder.encode(password));
        return adminAuthRepository.save(member);
    }

    public Long count() { return adminAuthRepository.count(); }

    public Optional<Admin> findByUsername(String username) { return adminAuthRepository.findByUsername(username); }
}