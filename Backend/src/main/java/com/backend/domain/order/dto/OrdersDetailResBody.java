package com.backend.domain.order.dto;

import java.util.List;

// 주문 상세 조회 응답 Body
public record OrdersDetailResBody(
            OrdersDto ordersDto,
            List<OrdersDetailDto> orderDetails
    ) {}