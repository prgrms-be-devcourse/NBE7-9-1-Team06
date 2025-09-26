package com.backend.domain.admin.order.service;

import com.backend.domain.admin.order.dto.AdminOrdersDto;
import com.backend.domain.admin.order.dto.OrdersListResBody;
import com.backend.domain.order.dto.OrdersDetailDto;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.repository.OrdersRepository;
import com.backend.domain.order.service.OrdersService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminOrderService {

    private final OrdersRepository ordersRepository;
    private final OrdersService ordersService;

    public OrdersListResBody getAdminOrdersList() {
        List<Orders> ordersList = ordersRepository.findAllWithDetails();

        List<OrdersListResBody.OrdersWithDetailsDto> ordersWithDetails = ordersList.stream()
                .map(orders -> {
                    AdminOrdersDto adminOrdersDto = new AdminOrdersDto(orders);

                    List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                            .map(OrdersDetailDto::new)
                            .collect(Collectors.toList());

                    return new OrdersListResBody.OrdersWithDetailsDto(adminOrdersDto, orderDetails);
                })
                .collect(Collectors.toList());

        return new OrdersListResBody(ordersWithDetails);
    }
}
