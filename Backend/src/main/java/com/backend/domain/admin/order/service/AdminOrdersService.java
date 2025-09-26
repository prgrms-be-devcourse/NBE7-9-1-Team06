package com.backend.domain.admin.order.service;

import com.backend.domain.admin.order.dto.AdminOrdersDetailResBody;
import com.backend.domain.admin.order.dto.AdminOrdersDto;
import com.backend.domain.admin.order.dto.AdminOrdersListResBody;
import com.backend.domain.order.dto.OrdersDetailDto;
import com.backend.domain.order.dto.OrdersDto;
import com.backend.domain.order.entity.OrderStatus;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.repository.OrdersRepository;
import com.backend.domain.order.service.OrdersService;
import com.backend.global.exception.ServiceException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminOrdersService {

    private final OrdersRepository ordersRepository;
    private final OrdersService ordersService;

    public AdminOrdersListResBody getAdminOrdersList() {
        List<Orders> ordersList = ordersRepository.findAllWithDetails();

        List<AdminOrdersListResBody.OrdersWithDetailsDto> ordersWithDetails = ordersList.stream()
                .map(orders -> {
                    AdminOrdersDto adminOrdersDto = new AdminOrdersDto(orders);

                    List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                            .map(OrdersDetailDto::new)
                            .collect(Collectors.toList());

                    return new AdminOrdersListResBody.OrdersWithDetailsDto(adminOrdersDto, orderDetails);
                })
                .collect(Collectors.toList());

        return new AdminOrdersListResBody(ordersWithDetails);
    }


//    public AdminOrdersUpdateResBody updateOrders(int ordersId, AdminOrdersUpdateReqBody reqBody) {
//        Orders orders = ordersService.findById(ordersId)
//                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 주문: " + ordersId));
//
//
//
//        return ();
//    }

    public AdminOrdersDetailResBody getAdminOrderDetail(int orderId) {
        Orders orders = ordersService.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 주문: " + orderId));

        boolean canModify = ordersService.canModifyOrder(orders.getOrderDate());
        OrdersDto OrdersDto = new OrdersDto(orders, canModify);

        List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                .map(OrdersDetailDto::new)
                .collect(Collectors.toList());

        return new AdminOrdersDetailResBody(OrdersDto, orderDetails);
    }


    public void adminDeleteOrder(Orders orders) {
        if (OrderStatus.CANCELLED.equals(orders.getStatus())) {
            throw new ServiceException("400-1", "이미 취소된 주문입니다.");
        }

        for(var detail : orders.getOrderDetails()) {
            var product = detail.getProduct();
            product.setQuantity(product.getQuantity() + detail.getOrderQuantity());
        }

        orders.setStatus(OrderStatus.CANCELLED);
        ordersRepository.save(orders);
    }
}
