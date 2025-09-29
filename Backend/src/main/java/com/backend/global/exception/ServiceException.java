package com.backend.global.exception;

import com.backend.global.rsData.RsData;

public class ServiceException extends RuntimeException {

    private final String resultCode;
    private final String msg;

    public ServiceException(String resultCode, String msg) {
        super("%s : %s".formatted(resultCode, msg));
        this.resultCode = resultCode;
        this.msg = msg;
    }

    public ServiceException(ErrorCode errorCode) {
        super("%s : %s".formatted(errorCode.getResultCode(), errorCode.getMsg()));
        this.resultCode = errorCode.getResultCode();
        this.msg = errorCode.getMsg();
    }

    public ServiceException(ErrorCode errorCode, String detailMsg) {
        super("%s : %s".formatted(errorCode.getResultCode(), errorCode.getMsg()));
        this.resultCode = errorCode.getResultCode();
        this.msg = detailMsg;
    }

    public String getResultCode() {
        return resultCode;
    }

    public String getMsg() {
        return msg;
    }

    public RsData getRsData() {
        return new RsData(resultCode, msg);
    }
}
