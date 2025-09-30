package com.backend.domain.order.controller;

import com.backend.domain.order.dto.OrdersDetailDto;
import com.backend.domain.order.dto.OrdersDto;
import com.backend.domain.order.dto.request.OrdersCreateRequest;
import com.backend.domain.order.dto.request.OrdersUpdateRequest;
import com.backend.domain.order.dto.response.OrdersCreateResponse;
import com.backend.domain.order.dto.response.OrdersDetailResponse;
import com.backend.domain.order.dto.response.OrdersListResponse;
import com.backend.domain.order.dto.response.OrdersUpdateResponse;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.service.OrdersService;
import com.backend.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrdersService ordersService;


    @PostMapping
    @Operation(summary = "주문 생성")
    public RsData<OrdersCreateResponse> createOrder(@Valid @RequestBody OrdersCreateRequest reqBody) {
        try {
            // 디버깅용 로그 추가
            System.out.println("🔍 주문 생성 요청 데이터:");
            System.out.println("Email: " + reqBody.getEmail());
            System.out.println("Address: " + reqBody.getAddress());
            System.out.println("ZipCode: " + reqBody.getZipCode());
            System.out.println("Items: " + reqBody.getItems());
            // OrderItem 변환
            List<OrdersService.OrderItem> orderItems = reqBody.getItems().stream()
                    .map(item -> new OrdersService.OrderItem(item.getProductId(), item.getQuantity()))
                    .collect(Collectors.toList());

            System.out.println("🔍 서비스 호출 전:");
            System.out.println("Email: " + reqBody.getEmail());
            System.out.println("Address: " + reqBody.getAddress());
            System.out.println("ZipCode: " + reqBody.getZipCode());
            
            Orders orders = ordersService.createOrders(
                    reqBody.getEmail(),
                    reqBody.getAddress(),
                    reqBody.getZipCode(),
                    orderItems
            );
            
            System.out.println("🔍 서비스 호출 후:");
            System.out.println("orders.getAddress(): " + orders.getAddress());
            boolean canModify = ordersService.canModifyOrder(orders);
            OrdersDto ordersDto = new OrdersDto(orders, canModify);

            List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                    .map(OrdersDetailDto::new)
                    .collect(Collectors.toList());

            return new RsData<>(
                    "201-1",
                    "%d번 주문이 생성되었습니다.".formatted(orders.getId()),
                    new OrdersCreateResponse(ordersDto, orderDetails)
            );
        } catch (IllegalArgumentException e) {
            return new RsData<>("400-1", e.getMessage());
        }
    }


    // 주문 목록 조회
    @GetMapping
    public RsData<OrdersListResponse> getOrdersList(@RequestParam String email) {
        List<Orders> ordersList = ordersService.findByEmail(email);

        List<OrdersListResponse.OrderSummary> summaries = ordersList.stream()
                .map(orders -> {
                    boolean canModify = ordersService.canModifyOrder(orders);
                    OrdersDto ordersDto = new OrdersDto(orders, canModify);

                    List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                            .map(OrdersDetailDto::new)
                            .collect(Collectors.toList());

                    return OrdersListResponse.OrderSummary.builder()
                            .ordersDto(ordersDto)
                            .orderDetails(orderDetails)
                            .build();
                }).toList();

        return new RsData<>(
                "200-1",
                "주문 목록을 조회했습니다.",
                OrdersListResponse.builder().orders(summaries).build()
        );
    }

    // 특정 주문 조회
    @GetMapping("/{orderId}")
    public RsData<OrdersDetailResponse> getOrdersDetail(@PathVariable int orderId) {
        Orders orders = ordersService.findById(orderId);

        boolean canModify = ordersService.canModifyOrder(orders);
        OrdersDto ordersDto = new OrdersDto(orders, canModify);

        List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                .map(OrdersDetailDto::new)
                .toList();

        return new RsData<>(
                "200-1",
                "%d번 주문을 조회했습니다.".formatted(orders.getId()),
                OrdersDetailResponse.builder()
                        .ordersDto(ordersDto)
                        .orderDetails(orderDetails)
                        .build()        );
    }


    // 주문 수정
    @PutMapping("/{orderId}")
    public RsData<OrdersUpdateResponse> updateOrders(
            @PathVariable int orderId,
            @RequestBody @Valid OrdersUpdateRequest reqBody) {

        // OrderItem 변환
        List<OrdersService.OrderItem> orderItems = reqBody.getItems().stream()
                .map(item -> new OrdersService.OrderItem(item.getProductId(), item.getQuantity()))
                .collect(Collectors.toList());

        Orders orders = ordersService.updateOrders(
                orderId,
                reqBody.getAddress(),
                reqBody.getZipCode(),
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
                new OrdersUpdateResponse(ordersDto, orderDetails)
        );
    }


    // 주문 취소
    @DeleteMapping("/{orderId}")
    public RsData<Void> deleteOrders(@PathVariable int orderId) {
        Orders orders = ordersService.findById(orderId);

        ordersService.deleteOrders(orders);

        return new RsData<>(
                "200-1",
                "%d번 주문이 취소되었습니다.".formatted(orderId)
        );
    }

}
