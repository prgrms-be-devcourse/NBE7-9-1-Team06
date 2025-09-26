package com.backend.domain.admin.order.controller;

import com.backend.domain.admin.order.dto.OrdersListResBody;
import com.backend.domain.admin.order.service.AdminOrderService;
import com.backend.domain.order.service.OrdersService;
import com.backend.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrdersService ordersService;
    private final AdminOrderService adminOrderService;


    //주문 목록 조회
    @GetMapping
    public RsData<OrdersListResBody> getOrdersList() {
        OrdersListResBody ordersListResBody = adminOrderService.getAdminOrdersList();
        return new RsData<>(
                "200-1",
                "모든 주문 목록을 조회했습니다.",
                ordersListResBody
        );
    }
}
