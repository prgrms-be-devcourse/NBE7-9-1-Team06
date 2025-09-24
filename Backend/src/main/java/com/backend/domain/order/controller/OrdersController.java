package com.backend.domain.order.controller;

import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.service.OrdersService;
import com.backend.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrdersService ordersService;

    // 주문 취소
    @DeleteMapping("/{orderId}")
    public RsData<Void> deleteOrders(@PathVariable int id){
        Orders orders = ordersService.findById(id).get();
        ordersService.deleteOrders(orders);

        return new RsData<Void>(
                "",
                "%d번 주문이 취소되었습니다.".formatted(id)
        );
    }

}
