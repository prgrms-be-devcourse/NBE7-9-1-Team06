package com.backend.domain.admin.order.dto;

import com.backend.domain.order.dto.OrdersDetailDto;
import com.backend.domain.order.dto.OrdersDto;

import java.util.List;

public record AdminOrdersDetailResBody(
            OrdersDto ordersDto,
            List<OrdersDetailDto> orderDetails
    ) {}