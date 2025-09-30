package com.backend.domain.order.dto.response;

import com.backend.domain.order.dto.OrdersDetailDto;
import com.backend.domain.order.dto.OrdersDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdersDetailResponse{
    private OrdersDto ordersDto;
    private List<OrdersDetailDto> orderDetails;
}
