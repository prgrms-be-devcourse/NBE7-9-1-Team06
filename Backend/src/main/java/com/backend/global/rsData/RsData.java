package com.backend.global.rsData;

<<<<<<< HEAD
import lombok.Getter;

@Getter
public class RsData<T> {
    private final String resultCode;
    private final String msg;
    private final T data;

    public RsData(String resultCode, String msg) {
        this(resultCode, msg, null);
    }

    public RsData(String resultCode, String msg, T data) {
        this.resultCode = resultCode;
        this.msg = msg;
        this.data = data;
    }
=======
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class RsData<T> {

    private String resultCode;
    private String msg;
    private T data;

    public RsData(String resultCode, String msg) {
        this.resultCode = resultCode;
        this.msg = msg;
        this.data = null;
    }

    @JsonIgnore
    public int getStatusCode() {
        String statusCode = resultCode.split("-")[0];
        return Integer.parseInt(statusCode);
    }

>>>>>>> 3b619eb (feat : 주문 취소 구현, RsData 생성)
}
