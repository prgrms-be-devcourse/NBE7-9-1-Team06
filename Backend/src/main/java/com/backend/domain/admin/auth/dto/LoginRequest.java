package com.backend.domain.admin.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
            @NotBlank
            @Size(min = 2, max = 30)
            String username,

            @NotBlank
            @Size(min = 2, max = 30)
            String password
    ) {
    }