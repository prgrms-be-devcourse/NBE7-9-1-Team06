package com.backend.domain.order.controller;

import com.backend.domain.order.dto.OrdersDetailDto;
import com.backend.domain.order.dto.OrdersDto;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.service.OrdersService;
import com.backend.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrdersService ordersService;

    // 주문 생성 요청 Body
    record OrdersCreateReqBody(
            @NotBlank String email,
            @NotBlank String address,
            @Positive int zipCode,
            @NotEmpty List<OrderItemReq> items
    ) {
        record OrderItemReq(
                @Positive int productId,
                @Positive int quantity
        ) {}
    }

    // 주문 생성 응답 Body
    record OrdersCreateResBody(
            OrdersDto ordersDto,
            List<OrdersDetailDto> orderDetails
    ) {}

    @PostMapping
    @Operation(summary = "주문 생성")
    public RsData<OrdersCreateResBody> createOrder(@Valid @RequestBody OrdersCreateReqBody reqBody) {
        try {
            // OrderItem 변환
            List<OrdersService.OrderItem> orderItems = reqBody.items().stream()
                    .map(item -> new OrdersService.OrderItem(item.productId(), item.quantity()))
                    .collect(Collectors.toList());

            Orders orders = ordersService.createOrders(
                    reqBody.email(),
                    reqBody.address(),
                    reqBody.zipCode(),
                    orderItems
            );
            boolean canModify = ordersService.canModifyOrder(orders.getOrderDate());
            OrdersDto ordersDto = new OrdersDto(orders, canModify);

            List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                    .map(OrdersDetailDto::new)
                    .collect(Collectors.toList());

            return new RsData<>(
                    "201-1",
                    "%d번 주문이 생성되었습니다.".formatted(orders.getId()),
                    new OrdersCreateResBody(ordersDto, orderDetails)
            );
        } catch (IllegalArgumentException e) {
            return new RsData<>("400-1", e.getMessage());
        } catch (java.util.NoSuchElementException e) {
            return new RsData<>("404-1", e.getMessage());
        }
        }


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