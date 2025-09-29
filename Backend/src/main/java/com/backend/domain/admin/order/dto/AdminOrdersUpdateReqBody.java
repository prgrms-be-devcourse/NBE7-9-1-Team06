package com.backend.domain.admin.order.dto;

import com.backend.domain.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record AdminOrdersUpdateReqBody(
            String address,
            Integer zipCode,
            List<OrderItemReq> items,
            @NotNull
            OrderStatus status
    ) {
        public record OrderItemReq(
                @Positive int productId,
                @Positive int quantity
        ) {}
    }