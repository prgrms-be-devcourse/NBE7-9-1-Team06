package com.backend.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // Product 도메인_1000번대
    PRODUCT_NOT_FOUND(1001, HttpStatus.NOT_FOUND, "상품이 존재하지 않습니다.");

    private final int code;
    private final HttpStatus status;
    private final String message;

    ErrorCode(int code, HttpStatus status, String message) {
        this.code = code;
        this.status = status;
        this.message = message;
    }
}
