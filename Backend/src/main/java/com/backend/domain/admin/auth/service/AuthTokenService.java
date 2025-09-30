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

    public Map<String, Object> getPayloadOrNull(String jwtToken) {
        Map<String, Object> payload = Ut.jwt.payloadOrNull(jwtToken, secretPattern);
        if (payload == null) {
            return null;
        }
        Number idNo = (Number) payload.get("id");
        int id = idNo.intValue();
        String username = (String) payload.get("username");
        String role = (String) payload.get("role");

        return Map.of("id", id, "username", username, "role", role);
    }
}