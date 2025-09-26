package com.backend.domain.admin.order.dto;

import com.backend.domain.order.dto.OrdersDetailDto;

import java.util.List;

public record OrdersListResBody(
        List<OrdersWithDetailsDto> orders
) {
    public record OrdersWithDetailsDto(
            AdminOrdersDto adminOrdersDto,
            List<OrdersDetailDto> orderDetails
    ) {}
}