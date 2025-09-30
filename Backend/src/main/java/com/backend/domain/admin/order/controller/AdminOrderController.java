package com.backend.domain.admin.order.controller;

import com.backend.domain.admin.order.dto.*;
import com.backend.domain.admin.order.service.AdminOrdersService;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.service.OrdersService;
import com.backend.global.exception.ErrorCode;
import com.backend.global.exception.ServiceException;
import com.backend.global.rsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrdersService ordersService;
    private final AdminOrdersService adminOrdersService;


    //주문 목록 조회
    @GetMapping
    public RsData<AdminOrdersListResBody> getOrdersList() {

        AdminOrdersListResBody adminOrdersListResBody = adminOrdersService.getAdminOrdersList();

        return new RsData<>(
                "200-1",
                "관리자 - 모든 주문 목록을 조회했습니다.",
                adminOrdersListResBody
        );
    }


    // 주문자 이메일로 주문 리스트 조회
    @GetMapping(params = "email")
    public RsData<AdminOrdersListResBody> getOrdersByEmail(
            @RequestParam("email") String email
    ) {

        AdminOrdersListResBody adminOrdersListResBody = adminOrdersService.getAdminOrdersByEmail(email);

        return new RsData<>(
                "200-1",
                "관리자 - %s의 주문 목록을 조회했습니다.".formatted(email),
                adminOrdersListResBody
        );
    }


    // 합배송 처리 가능한 주문 목록 조회
    @PostMapping
    public RsData<AdminOrdersListResBody> getMergeableOrders(
            @RequestParam String email,
            @RequestBody AdminMergeableOrdersRequest request
    ) {
        AdminOrdersListResBody adminOrdersListResBody = adminOrdersService.getMergeableOrders(
                email,
                request.date()
        );

        return new RsData<>(
                "200-1",
                "관리자 - 합배송 처리 가능한 주문 목록을 성공적으로 조회했습니다.",
                adminOrdersListResBody
        );
    }


    //주문 상세 조회
    @GetMapping("/{orderId}")
    public RsData<AdminOrdersDetailResBody> getOrderDetail(
            @PathVariable int orderId
    ) {
        AdminOrdersDetailResBody adminOrdersDetailResBody = adminOrdersService.getAdminOrderDetail(orderId);

        return new RsData<>(
                "200-1",
                "관리자 - %d번 주문의 상세 정보를 조회했습니다.".formatted(orderId),
                adminOrdersDetailResBody
        );
    }


    //주문 취소
    @DeleteMapping("/{orderId}")
    public RsData<Object> deleteOrder(
            @PathVariable int orderId
    ) {
        Orders orders = ordersService.findById(orderId);
        if (orders == null) {
            throw new ServiceException(ErrorCode.ORDER_NOT_FOUND);
        }

        adminOrdersService.adminDeleteOrder(orders);

        return new RsData<>(
                "200-1",
                "관리자 - %d번 주문이 취소되었습니다.".formatted(orderId)
        );
    }


    //주문 수정
    @PutMapping("/{orderId}")
    public RsData<AdminOrdersUpdateResBody> updateOrder(
            @PathVariable int orderId,
            @RequestBody AdminOrdersUpdateReqBody reqBody
    ) {
        AdminOrdersUpdateResBody resBody = adminOrdersService.adminUpdateOrder(orderId, reqBody);


        return new RsData<>(
                "200-1",
                "관리자 - %d번 주문이 수정되었습니다.".formatted(orderId),
                resBody);
    }



}