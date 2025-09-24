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
        String status
){
    public OrdersDto(Orders orders){
        this(
                orders.getId(),
                orders.getEmail(),
                orders.getAddress(),
                orders.getZipCode(),
                orders.getTotalPrice(),
                orders.getOrderDate(),
                orders.getStatus()
        );
    }
}
