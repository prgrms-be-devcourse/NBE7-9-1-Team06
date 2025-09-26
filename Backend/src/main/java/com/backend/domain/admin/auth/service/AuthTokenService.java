package com.backend.domain.admin.auth.service;

import com.backend.domain.admin.auth.entity.Admin;
import com.backend.standard.ut.Ut;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthTokenService {

    @Value("${custom.jwt.secretPattern}")
    private String secretPattern;
    @Value("${custom.jwt.expireSeconds}")
    private long expireSeconds;

    public String genAccessToken(Admin admin) {

        return Ut.jwt.toString(
                secretPattern,
                expireSeconds,
                Map.of(
                        "id", admin.getId(),
                        "username", admin.getUsername(),
                        "role", "ROLE_ADMIN"
                )
        );
    }

    Map<String, Object> payloadOrNull(String jwt) {
        Map<String, Object> payload = Ut.jwt.payloadOrNull(jwt, secretPattern);

        if(payload == null) {
            return null;
        }

        Number idNo = (Number)payload.get("id");
        int id = idNo.intValue();

        String username = (String)payload.get("username");

        return Map.of("id", id, "username", username);
    }

    public Map<String, Object> getPayloadOrNull(String jwtToken) {
        // Ut.jwt 클래스의 payloadOrNull 메서드를 호출하여 페이로드 추출
        return Ut.jwt.payloadOrNull(jwtToken, secretPattern);
    }
}
