package com.backend.domain.admin.dto;

import com.backend.domain.order.entity.Order;

public record AdminOrderDto(
        String customerEmail,
        int orderId,
        int totalPrice,
        String status
) {
    public AdminOrderDto(Order order) {
        this(
                order.getEmail(),
                order.getId(),
                order.getTotalPrice(),
                order.getStatus()
        );
    }
}
