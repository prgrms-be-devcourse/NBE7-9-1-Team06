package com.backend.domain.order.controller;

import com.backend.domain.order.dto.OrdersDetailDto;
import com.backend.domain.order.dto.OrdersDto;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.service.OrdersService;
import com.backend.global.exception.ServiceException;
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
            boolean canModify = ordersService.canModifyOrder(orders);
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
        }
    }

    // 주문 목록 조회 응답 Body
    record OrdersListResBody(
            List<OrdersWithDetailsDto> orders
    ) {
        record OrdersWithDetailsDto(
                OrdersDto ordersDto,
                List<OrdersDetailDto> orderDetails
        ) {}
    }

    // 주문 상세 조회 응답 Body
    record OrdersDetailResBody(
            OrdersDto ordersDto,
            List<OrdersDetailDto> orderDetails
    ) {}

    // 주문 목록 조회
    @GetMapping
    public RsData<OrdersListResBody> getOrdersList(@RequestParam String email) {
        List<Orders> ordersList = ordersService.findByEmail(email);

        List<OrdersListResBody.OrdersWithDetailsDto> ordersWithDetails = ordersList.stream()
                .map(orders -> {
                    boolean canModify = ordersService.canModifyOrder(orders);
                    OrdersDto ordersDto = new OrdersDto(orders, canModify);

                    List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                            .map(OrdersDetailDto::new)
                            .collect(Collectors.toList());

                    return new OrdersListResBody.OrdersWithDetailsDto(ordersDto, orderDetails);
                })
                .collect(Collectors.toList());

        return new RsData<>(
                "200-1",
                "주문 목록을 조회했습니다.",
                new OrdersListResBody(ordersWithDetails)
        );
    }

    // 특정 주문 조회
    @GetMapping("/{orderId}")
    public RsData<OrdersDetailResBody> getOrdersDetail(@PathVariable int orderId) {
        Orders orders = ordersService.findById(orderId)
                .orElseThrow(() -> new ServiceException("404-1", "%d번 주문을 찾을 수 없습니다.".formatted(orderId)));

        boolean canModify = ordersService.canModifyOrder(orders);
        OrdersDto ordersDto = new OrdersDto(orders, canModify);

        List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                .map(OrdersDetailDto::new)
                .collect(Collectors.toList());

        return new RsData<>(
                "200-1",
                "%d번 주문을 조회했습니다.".formatted(orders.getId()),
                new OrdersDetailResBody(ordersDto, orderDetails)
        );
    }

    // 주문 수정 요청 Body
    record OrdersUpdateReqBody(
            String address,
            Integer zipCode,
            List<OrderItemReq> items
    ) {
        record OrderItemReq(
                @Positive int productId,
                @Positive int quantity
        ) {}
    }

    // 주문 수정 응답 Body
    record OrdersUpdateResBody(
            OrdersDto ordersDto,
            List<OrdersDetailDto> orderDetails
    ) {}

    // 주문 수정
    @PutMapping("/{orderId}")
    public RsData<OrdersUpdateResBody> updateOrders(
            @PathVariable int orderId,
            @RequestBody @Valid OrdersUpdateReqBody reqBody) {

        // OrderItem 변환
        List<OrdersService.OrderItem> orderItems = reqBody.items().stream()
                .map(item -> new OrdersService.OrderItem(item.productId(), item.quantity()))
                .collect(Collectors.toList());

        Orders orders = ordersService.updateOrders(
                orderId,
                reqBody.address(),
                reqBody.zipCode(),
                orderItems
        );

        // 응답 데이터 구성
        boolean canModify = ordersService.canModifyOrder(orders);
        OrdersDto ordersDto = new OrdersDto(orders, canModify);

        List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                .map(OrdersDetailDto::new)
                .collect(Collectors.toList());

        return new RsData<>(
                "200-1",
                "%d번 주문이 수정되었습니다.".formatted(orderId),
                new OrdersUpdateResBody(ordersDto, orderDetails)
        );
    }


    // 주문 취소
    @DeleteMapping("/{orderId}")
    public RsData<Void> deleteOrders(@PathVariable int orderId) {

        Orders orders = ordersService.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        ordersService.deleteOrders(orders);

        return new RsData<>(
                "200-1",
                "%d번 주문이 취소되었습니다.".formatted(orderId)
        );

    }

}
