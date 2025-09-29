package com.backend.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request
    ORDER_ALREADY_CANCELLED("400-1", "이미 취소된 주문입니다."),
    INVALID_INPUT_VALUE("400-2", "잘못된 입력 값입니다."),

    // 401 Unauthorized
    UNAUTHORIZED("401-1", "인증되지 않은 사용자입니다."),
    INVALID_TOKEN("401-2", "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN("401-3", "만료된 토큰입니다."),
    INVALID_PERMISSION("401-4", "권한이 없습니다."),
    PASSWORD_NOT_MATCH("401-5", "비밀번호가 일치하지 않습니다."),
    ALREADY_USED_USERNAME("401-6", "이미 사용중인 아이디입니다."),

    // 404 Not Found
    ORDER_NOT_FOUND("404-1", "존재하지 않는 주문입니다."),
    PRODUCT_NOT_FOUND("404-2", "존재하지 않는 상품입니다.");




    private final String resultCode;
    private final String msg;
}
