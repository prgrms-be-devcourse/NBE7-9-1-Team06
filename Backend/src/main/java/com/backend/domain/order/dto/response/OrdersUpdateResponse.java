package com.backend.domain.order.dto.response;

import com.backend.domain.order.dto.OrdersDetailDto;
import com.backend.domain.order.dto.OrdersDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class OrdersUpdateResponse {
    private OrdersDto ordersDto;
    private List<OrdersDetailDto> orderDetails;
}
