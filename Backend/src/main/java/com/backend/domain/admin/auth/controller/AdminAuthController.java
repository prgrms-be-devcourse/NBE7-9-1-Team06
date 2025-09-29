package com.backend.domain.admin.auth.controller;

import com.backend.domain.admin.auth.dto.LoginRequest;
import com.backend.domain.admin.auth.dto.LoginResponse;
import com.backend.domain.admin.auth.entity.Admin;
import com.backend.domain.admin.auth.service.AdminAuthService;
import com.backend.domain.admin.auth.service.AuthTokenService;
import com.backend.global.exception.ErrorCode;
import com.backend.global.exception.ServiceException;
import com.backend.global.rq.Rq;
import com.backend.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final AuthTokenService authTokenService;
    private final Rq rq;

    @PostMapping("/login")
    public RsData<LoginResponse> login(
            @RequestBody LoginRequest loginReqBody
    ) {

        Admin admin = adminAuthService.findByUsername(loginReqBody.username())
                .orElseThrow(() -> new ServiceException(ErrorCode.ADMIN_NOT_FOUND)
                );

        adminAuthService.checkPassword(loginReqBody.password(), admin.getPassword());
        String accessToken = authTokenService.genAccessToken(admin);

        LoginResponse loginResponse= new LoginResponse(accessToken);

        rq.setCookie("accessToken", accessToken);

        return new RsData(
                "200-1",
                "로그인 성공",
                loginResponse
        );
    }

    @DeleteMapping("/logout")
    public RsData<Void> logout() {

        rq.deleteCookie("accessToken");

        return new RsData<>(
                "200-1",
                "로그아웃 성공"
        );
    }

}