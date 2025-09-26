package com.backend.global.globalExceptionHandler;

import com.backend.global.exception.ServiceException;
import com.backend.global.rsData.RsData;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ServiceException.class)
    @ResponseBody
    public RsData<Void> handleServiceException(ServiceException e) {
        return new RsData<>(
                e.getResultCode(),
                e.getMsg()
        );
    }
}

