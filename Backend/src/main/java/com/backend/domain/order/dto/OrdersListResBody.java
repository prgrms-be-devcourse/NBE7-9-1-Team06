package com.backend.domain.order.dto;

import java.util.List;

// 주문 목록 조회 응답 Body
    public record OrdersListResBody(
            List<OrdersWithDetailsDto> orders
    ) {
        public record OrdersWithDetailsDto(
                OrdersDto ordersDto,
                List<OrdersDetailDto> orderDetails
        ) {}
    }