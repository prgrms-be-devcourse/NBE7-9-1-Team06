package com.backend.domain.admin.order.dto;

import com.backend.domain.order.dto.OrdersDetailDto;
import com.backend.domain.order.dto.OrdersDto;

import java.util.List;

public record AdminOrdersListResBody(
        List<OrdersWithDetailsDto> orders
) {
    public record OrdersWithDetailsDto(
            OrdersDto ordersDto,
            List<OrdersDetailDto> orderDetails
    ) {}
}