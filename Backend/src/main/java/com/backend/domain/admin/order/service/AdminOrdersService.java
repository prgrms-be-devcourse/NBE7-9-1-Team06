package com.backend.domain.admin.order.service;

import com.backend.domain.admin.order.dto.AdminOrdersDetailResBody;
import com.backend.domain.admin.order.dto.AdminOrdersListResBody;
import com.backend.domain.admin.order.dto.AdminOrdersUpdateReqBody;
import com.backend.domain.admin.order.dto.AdminOrdersUpdateResBody;
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
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminOrdersService {

    private static final LocalTime CUTOFF_TIME = LocalTime.of(14, 0);
    private final OrdersRepository ordersRepository;
    private final OrdersDetailRepository ordersDetailRepository;
    private final ProductRepository productRepository;
    private final OrdersService ordersService;

    // 전체 주문 목록 조회
    public AdminOrdersListResBody getAdminOrdersList() {
        List<Orders> ordersList = ordersRepository.findAllWithDetails();

        return getAdminOrdersListResBody(ordersList);
    }


    // 주문자 이메일로 주문 목록 조회
    public AdminOrdersListResBody getAdminOrdersByEmail(String email) {

        List<Orders> ordersList = ordersRepository.findByEmailOrderByOrderDateDesc(email);

        if (ordersList.isEmpty()) {
            throw new ServiceException(ErrorCode.ORDER_NOT_FOUND, "해당 이메일로 주문된 내역이 없습니다: " + email);
        }

        return getAdminOrdersListResBody(ordersList);

    }


    // 주문 목록과 상세 정보를 포함한 응답 생성
    @NotNull
    private AdminOrdersListResBody getAdminOrdersListResBody(List<Orders> ordersList) {
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
        for (var detail : orders.getOrderDetails()) {
            var product = detail.getProduct();
            product.setQuantity(product.getQuantity() + detail.getOrderQuantity());
        }
        orders.setStatus(OrderStatus.CANCELLED);
        ordersRepository.save(orders);
    }


    // 주문 수정
    public AdminOrdersUpdateResBody adminUpdateOrder(int orderId, AdminOrdersUpdateReqBody reqBody) {

        Orders orders = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ServiceException(ErrorCode.ORDER_NOT_FOUND));

        if (OrderStatus.CANCELLED.equals(orders.getStatus())) {
            throw new ServiceException(ErrorCode.ORDER_ALREADY_CANCELLED);
        }

        rollbackStock(orders);
        int newTotalPrice = updateOrderDetailsAndStock(orders, reqBody.items());
        updateOrderInfo(orders, reqBody.address(), reqBody.zipCode(), newTotalPrice);

        ordersRepository.save(orders);

        return new AdminOrdersUpdateResBody(
                new OrdersDto(orders, ordersService.canModifyOrder(orders.getOrderDate())),
                orders.getOrderDetails().stream().map(OrdersDetailDto::new).collect(Collectors.toList())
        );
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

        // OrderItemReq를 productId 기준으로 합산하여 중복 제거
        Map<Integer, Integer> productQuantityMap = new HashMap<>();
        for (AdminOrdersUpdateReqBody.OrderItemReq itemReq : items) {
            productQuantityMap.merge(itemReq.productId(), itemReq.quantity(), Integer::sum);
        }

        for (Map.Entry<Integer, Integer> entry : productQuantityMap.entrySet()) {
            int productId = entry.getKey();
            int quantity = entry.getValue();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ServiceException(ErrorCode.PRODUCT_NOT_FOUND));

            if (quantity <= 0) {
                throw new ServiceException(ErrorCode.INVALID_INPUT_VALUE, "수량은 1 이상이어야 합니다: " + product.getProductName());
            }
            if (product.getQuantity() < quantity) {
                throw new ServiceException(ErrorCode.INVALID_INPUT_VALUE, "재고가 부족합니다: " + product.getProductName());
            }

            OrdersDetail newDetail = new OrdersDetail();
            newDetail.setProduct(product);
            newDetail.setOrderQuantity(quantity);
            newDetail.setPrice(product.getProductPrice() * quantity);
            newDetail.setOrders(orders);

            ordersDetailRepository.save(newDetail);
            orders.getOrderDetails().add(newDetail);

            product.setQuantity(product.getQuantity() - quantity);
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


    // 합배송 처리 가능한 주문 목록 조회
    public AdminOrdersListResBody getMergeableOrders(String email, LocalDate date) {
        // 기준일의 전날 오후 2시
        LocalDateTime start = date.minusDays(1).atTime(14, 0);
        // 기준일 오후 2시
        LocalDateTime end = date.atTime(14, 0);

        // 합배송 처리 가능한 주문 상태 정의
        List<OrderStatus> mergeableStatuses = Arrays.asList(OrderStatus.PENDING, OrderStatus.CONFIRMED);

        // Repository를 호출하여 주문 목록 조회
        List<Orders> ordersList = ordersRepository.findMergeableOrders(email, mergeableStatuses, start, end);

        if (ordersList.isEmpty()) {
            throw new ServiceException(ErrorCode.ORDER_NOT_FOUND, "합배송 처리 가능한 주문이 없습니다.");
        }

        return getAdminOrdersListResBody(ordersList);
    }
}
