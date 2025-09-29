package com.backend.domain.order.dto;

import com.backend.domain.order.entity.Orders;

import java.time.LocalDateTime;

public record OrdersDto (
        int id,
        String email,
        String address,
        int zipCode,
        int totalPrice,
        LocalDateTime orderDate,
        String status,
        boolean canModify // 14시 기준 수정 가능 여부
){
    public OrdersDto(Orders orders, boolean canModify){
        this(
                orders.getId(),
                orders.getEmail(),
                orders.getAddress(),
                orders.getZipCode(),
                orders.getTotalPrice(),
                orders.getOrderDate(),
                orders.getStatus(),
                canModify
        );
    }
}
