package com.backend.domain.admin.auth.controller;

import com.backend.domain.admin.auth.entity.Admin;
import com.backend.domain.admin.auth.service.AdminAuthService;
import com.backend.domain.admin.auth.service.AuthTokenService;
import com.backend.global.exception.ServiceException;
import com.backend.global.rq.Rq;
import com.backend.global.rsData.RsData;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final AuthTokenService authTokenService;
    private final Rq rq;

    record LoginRequest(
            @NotBlank
            @Size(min = 2, max = 30)
            String username,

            @NotBlank
            @Size(min = 2, max = 30)
            String password
    ) {
    }

    record LoginResponse(
            String accessToken
    ) {
    }

    @PostMapping("/login")
    public RsData<LoginResponse> login(
            @RequestBody LoginRequest loginReqBody
    ) {

        Admin admin = adminAuthService.findByUsername(loginReqBody.username)
                .orElseThrow(() -> new ServiceException("401-1", "존재하지 않는 아이디입니다.")
        );

        adminAuthService.checkPassword(loginReqBody.password, admin.getPassword());
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
