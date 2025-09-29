package com.backend.domain.admin.order.dto;

import com.backend.domain.order.entity.OrderStatus;
import com.backend.domain.order.entity.Orders;

import java.time.LocalDateTime;

public record AdminOrdersDto(
        int id,
        String email,
        String address,
        int zipCode,
        int totalPrice,
        LocalDateTime orderDate,
        OrderStatus status
){
    public AdminOrdersDto(Orders orders){
        this(
                orders.getId(),
                orders.getEmail(),
                orders.getAddress() != null ? orders.getAddress() : "주소정보없음",
                orders.getZipCode(),
                orders.getTotalPrice(),
                orders.getOrderDate(),
                orders.getStatus()
        );
    }
}
