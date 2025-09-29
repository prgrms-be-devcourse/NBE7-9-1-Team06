package com.backend.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // Product 도메인_1000번대
    PRODUCT_NOT_FOUND(1001, HttpStatus.NOT_FOUND, "상품이 존재하지 않습니다."),

    // Order 도메인_2000번대
    ORDER_NOT_FOUND(2001, HttpStatus.NOT_FOUND, "주문이 존재하지 않습니다."),
    ORDER_ALREADY_CONFIRMED(2002, HttpStatus.BAD_REQUEST, "이미 확정된 주문입니다."),
    ORDER_CANCELLATION_NOT_ALLOWED(2003, HttpStatus.BAD_REQUEST, "14시 이후에는 주문을 취소할 수 없습니다."),
    ORDER_INVALID_QUANTITY(2004, HttpStatus.BAD_REQUEST, "수량은 1 이상이어야 합니다."),
    ORDER_PRODUCT_STOCK_SHORTAGE(2005, HttpStatus.BAD_REQUEST, "상품 재고가 부족합니다."),
    ORDER_ALREADY_CANCELLED(2006, HttpStatus.CONFLICT, "이미 취소된 주문입니다."),
    ORDER_NOT_MODIFIABLE(2007, HttpStatus.FORBIDDEN, "확정된 주문은 수정/취소할 수 없습니다."),
    ORDER_LIST_EMPTY(2008, HttpStatus.NOT_FOUND, "해당 이메일의 주문이 없습니다."),

    // Admin 도메인_3000번대
    ADMIN_NOT_FOUND(3001, HttpStatus.NOT_FOUND, "존재하지 않는 아이디입니다."),
    ADMIN_INVALID_PASSWORD(3002, HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다."),
    ADMIN_USERNAME_DUPLICATED(3003, HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다."),
    ACCESS_TOKEN_NOT_FOUND(3004, HttpStatus.UNAUTHORIZED, "액세스 토큰이 없습니다."),
    ACCESS_TOKEN_INVALID(3005, HttpStatus.UNAUTHORIZED, "액세스 토큰이 유효하지 않습니다."),
    USER_NOT_FOUND(3006, HttpStatus.NOT_FOUND, "사용자 정보를 찾을 수 없습니다.");


    // 공통 4000번대

    private final int code;
    private final HttpStatus status;
    private final String message;

    ErrorCode(int code, HttpStatus status, String message) {
        this.code = code;
        this.status = status;
        this.message = message;
    }



}