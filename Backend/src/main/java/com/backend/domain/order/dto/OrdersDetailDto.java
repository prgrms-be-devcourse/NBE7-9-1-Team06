package com.backend.domain.order.dto;

import com.backend.domain.order.entity.OrdersDetail;

public record OrdersDetailDto (
        int id,
        int productId,
        String productName,
        int quantity,
        int price
) {
    public OrdersDetailDto(OrdersDetail ordersDetail) {
        this(
                ordersDetail.getId(),
                ordersDetail.getProduct().getProductId(),
                ordersDetail.getProduct().getProductName(),
                ordersDetail.getOrderQuantity(),
                ordersDetail.getPrice()
        );
    }
}