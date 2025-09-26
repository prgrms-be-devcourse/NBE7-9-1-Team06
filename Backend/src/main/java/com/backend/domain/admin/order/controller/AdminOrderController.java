package com.backend.domain.admin.order.controller;

import com.backend.domain.admin.order.dto.AdminOrdersDetailResBody;
import com.backend.domain.admin.order.dto.AdminOrdersListResBody;
import com.backend.domain.admin.order.service.AdminOrdersService;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.service.OrdersService;
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

        Orders orders = ordersService.findById(orderId)
                .orElseThrow(() -> new ServiceException("401 - 2","존재하지 않는 주문입니다."));

        adminOrdersService.adminDeleteOrder(orders);

        return new RsData<>(
                "200-1",
                "%d번 주문이 취소되었습니다.".formatted(orderId)
        );
    }

//    //주문 수정
//    @PutMapping("/{orderId}")
//    public RsData<AdminOrdersUpdateResBody> updateOrder(
//            @PathVariable int orderId,
//            @RequestBody AdminOrdersUpdateReqBody reqBody
//    ) {
//
//        AdminOrdersListResBody adminOrdersListResBody = adminOrderService.updateOrders(orderId, reqBody);
//        return new RsData<>(
//                "200-1",
//                "%번 주문이 수정되었습니다.".formatted(),
//                adminOrdersListResBody
//        );
//    }

//    // 합배송 처리
//    @PostMapping("/merge")
//    public RsData<?> mergeOrdersByDate(
//            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate baseDate
//    ) {
//        return adminOrderService.mergeOrdersByDate(baseDate);
//    }
}
