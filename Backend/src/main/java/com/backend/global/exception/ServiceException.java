package com.backend.global.exception;

import com.backend.global.rsData.RsData;

public class ServiceException extends RuntimeException {

    private final ErrorCode errorCode;

    public ServiceException(ErrorCode errorCode) {
        super("%d : %s".formatted(errorCode.getCode(), errorCode.getMessage()));
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public RsData getRsData() {
        return new RsData(resultCode, msg);
    }
}
