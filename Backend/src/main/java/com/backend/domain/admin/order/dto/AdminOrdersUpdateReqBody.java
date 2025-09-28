package com.backend.domain.admin.order.dto;

import jakarta.validation.constraints.Positive;

import java.util.List;

public record AdminOrdersUpdateReqBody(
            String address,
            Integer zipCode,
            List<OrderItemReq> items
    ) {
        public record OrderItemReq(
                @Positive int productId,
                @Positive int quantity
        ) {}
    }