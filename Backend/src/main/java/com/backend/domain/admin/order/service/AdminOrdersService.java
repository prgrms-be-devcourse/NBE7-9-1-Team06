package com.backend.domain.admin.order.service;

import com.backend.domain.admin.order.dto.AdminOrdersDetailResBody;
import com.backend.domain.admin.order.dto.AdminOrdersListResBody;
import com.backend.domain.admin.order.dto.AdminOrdersUpdateReqBody;
import com.backend.domain.order.dto.OrdersDetailDto;
import com.backend.domain.order.dto.OrdersDto;
import com.backend.domain.order.entity.OrderStatus;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.entity.OrdersDetail;
import com.backend.domain.order.repository.OrdersDetailRepository;
import com.backend.domain.order.repository.OrdersRepository;
import com.backend.domain.order.service.OrdersService;
import com.backend.domain.product.entity.Product;
import com.backend.domain.product.repository.ProductRepository;
import com.backend.global.exception.ErrorCode;
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
    private final OrdersDetailRepository ordersDetailRepository;
//    private final OrdersService ordersService;
    private final ProductRepository productRepository;
    private final OrdersService ordersService;

    // 전체 주문 목록 조회
    public AdminOrdersListResBody getAdminOrdersList() {
        List<Orders> ordersList = ordersRepository.findAllWithDetails();

        List<AdminOrdersListResBody.OrdersWithDetailsDto> ordersWithDetails = ordersList.stream()
                .map(orders -> {
                    boolean canModify = ordersService.canModifyOrder(orders.getOrderDate());
                    OrdersDto ordersDto = new OrdersDto(orders, canModify);

                    List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                            .map(OrdersDetailDto::new)
                            .collect(Collectors.toList());

                    return new AdminOrdersListResBody.OrdersWithDetailsDto(ordersDto, orderDetails);
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

    // 주문 상세 조회
    public AdminOrdersDetailResBody getAdminOrderDetail(int orderId) {
        Orders orders = ordersService.findById(orderId)
                .orElseThrow(() -> new ServiceException(ErrorCode.ORDER_NOT_FOUND));


        boolean canModify = ordersService.canModifyOrder(orders.getOrderDate());

        OrdersDto OrdersDto = new OrdersDto(orders, canModify);

        List<OrdersDetailDto> orderDetails = orders.getOrderDetails().stream()
                .map(OrdersDetailDto::new)
                .collect(Collectors.toList());

        return new AdminOrdersDetailResBody(OrdersDto, orderDetails);
    }

    // 주문 삭제 (취소)
    public void adminDeleteOrder(Orders orders) {
        if (OrderStatus.CANCELLED.equals(orders.getStatus())) {
            throw new ServiceException(ErrorCode.ORDER_ALREADY_CANCELLED);
        }
        for(var detail : orders.getOrderDetails()) {
            var product = detail.getProduct();
            product.setQuantity(product.getQuantity() + detail.getOrderQuantity());
        }
        orders.setStatus(OrderStatus.CANCELLED);
        ordersRepository.save(orders);
    }

    // 주문 수정
    public void adminUpdateOrder(int orderId, AdminOrdersUpdateReqBody reqBody) {

        Orders orders = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ServiceException(ErrorCode.ORDER_NOT_FOUND));

        if (OrderStatus.CANCELLED.equals(orders.getStatus())) {
            throw new ServiceException(ErrorCode.ORDER_ALREADY_CANCELLED);
        }

        rollbackStock(orders);
        int newTotalPrice = updateOrderDetailsAndStock(orders, reqBody.items());
        updateOrderInfo(orders, reqBody.address(), reqBody.zipCode(), newTotalPrice);

        ordersRepository.save(orders);
    }

    // 기존 재고 원복
    private void rollbackStock(Orders orders) {
        for (OrdersDetail detail : orders.getOrderDetails()) {
            Product product = detail.getProduct();
            product.setQuantity(product.getQuantity() + detail.getOrderQuantity());
            productRepository.save(product);
        }
    }

    // 주문 상세 내역 갱신 및 재고 차감
    private int updateOrderDetailsAndStock(Orders orders, List<AdminOrdersUpdateReqBody.OrderItemReq> items) {
        orders.getOrderDetails().clear();
        int newTotalPrice = 0;

        for (AdminOrdersUpdateReqBody.OrderItemReq itemReq : items) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ServiceException(ErrorCode.PRODUCT_NOT_FOUND));

            if (product.getQuantity() < itemReq.quantity()) {
                throw new ServiceException(ErrorCode.INVALID_INPUT_VALUE);
            }

            OrdersDetail newDetail = new OrdersDetail();
            newDetail.setProduct(product);
            newDetail.setOrderQuantity(itemReq.quantity());
            newDetail.setPrice(product.getProductPrice() * itemReq.quantity());
            newDetail.setOrders(orders);

            ordersDetailRepository.save(newDetail); // OrdersDetail 저장

            orders.getOrderDetails().add(newDetail);
            product.setQuantity(product.getQuantity() - itemReq.quantity());
            productRepository.save(product);

            newTotalPrice += newDetail.getPrice();
        }
        return newTotalPrice;
    }

    // 주문 정보 업데이트
    private void updateOrderInfo(Orders orders, String address, Integer zipCode, int totalPrice) {
        orders.setAddress(address);
        orders.setZipCode(zipCode);
        orders.setTotalPrice(totalPrice);
    }
}
