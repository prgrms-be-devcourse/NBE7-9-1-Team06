package com.backend.domain.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import lombok.Getter;

import java.util.List;

@Getter
public class OrdersCreateRequest {
    @NotBlank private String email;
    @NotBlank private String address;
    @Positive private int zipCode;
    @NotEmpty @Valid
    private List<OrderItemRequest> items;

    @Getter
    public static class OrderItemRequest {
        @Positive private int productId;
        @Positive private int quantity;
    }
}
