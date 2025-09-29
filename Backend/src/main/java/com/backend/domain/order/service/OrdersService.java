package com.backend.domain.order.service;

import com.backend.domain.order.entity.OrderStatus;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.entity.OrdersDetail;
import com.backend.domain.order.repository.OrdersDetailRepository;
import com.backend.domain.order.repository.OrdersRepository;
import com.backend.domain.product.entity.Product;
import com.backend.domain.product.repository.ProductRepository;
import com.backend.global.exception.ErrorCode;
import com.backend.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrdersService {
    private final OrdersRepository ordersRepository;
    private final OrdersDetailRepository ordersDetailRepository;
    private final ProductRepository productRepository;

    public Long count() {
        return ordersRepository.count();
    }

    // 주문 아이템 record
    public record OrderItem(int productId, int quantity) {}

    public Orders createOrders(String email, String address, int zipCode, List<OrderItem> items) {
        // 주문 엔티티 생성
        Orders order = new Orders();
        order.setEmail(email);
        order.setAddress(address);
        order.setZipCode(zipCode);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);


        // 총 가격 계산 및 주문 상세 생성
        int totalPrice = 0;
        for (OrderItem item : items) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ServiceException(ErrorCode.PRODUCT_NOT_FOUND));

            if (item.quantity() <= 0) {
                throw new ServiceException(ErrorCode.ORDER_INVALID_QUANTITY);
            }
            if (product.getQuantity() < item.quantity()) {
                throw new ServiceException(ErrorCode.ORDER_PRODUCT_STOCK_SHORTAGE);
            }

            // 주문 상세 생성
            OrdersDetail orderDetail = new OrdersDetail();
            orderDetail.setProduct(product);
            orderDetail.setOrderQuantity(item.quantity());
            orderDetail.setPrice(product.getProductPrice() * item.quantity());
            order.addDetail(orderDetail);


            // 재고 차감
            product.setQuantity(product.getQuantity() - item.quantity());
            totalPrice += orderDetail.getPrice();
        }

        // 총 가격 업데이트
        order.setTotalPrice(totalPrice);
        return ordersRepository.save(order);
    }


    // 이메일로 주문 목록 조회
    @Transactional(readOnly = true)
    public List<Orders> findByEmail(String email) {
        List<Orders> orders = ordersRepository.findByEmailOrderByOrderDateDesc(email);
        if (orders.isEmpty()) {
            throw new ServiceException(ErrorCode.ORDER_LIST_EMPTY);
        }
        // Lazy Loading 강제 초기화
        for (Orders order : orders) {
            order.getOrderDetails().size(); // 강제 로딩
        }
        return orders;
    }

    // ID로 주문 조회
    @Transactional(readOnly = true)
    public Orders findById(int id) {
        Orders order = ordersRepository.findById(id)
                .orElseThrow(() -> new ServiceException(ErrorCode.ORDER_NOT_FOUND));

        // Lazy Loading 강제 초기화
        order.getOrderDetails().size();

        return order;
    }


    @Transactional
    public Orders updateOrders(int orderId, String address, Integer zipCode, List<OrderItem> items) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new ServiceException(ErrorCode.ORDER_NOT_FOUND));

        // 상태 기반 수정 가능 여부 확인
        if (!order.getStatus().isCustomerModifiable()) {
            throw new ServiceException(ErrorCode.ORDER_NOT_MODIFIABLE);
        }

        // 요청 아이템 productId별 합산(중복 productId 방지)
        Map<Integer, Integer> requestedQty = new LinkedHashMap<>();
        for (OrderItem item : items) {
            if (item.quantity() <= 0) throw new ServiceException(ErrorCode.ORDER_INVALID_QUANTITY);
            requestedQty.merge(item.productId(), item.quantity(), Integer::sum);
        }

        Map<Integer, OrdersDetail> current = order.getOrderDetails().stream()
                .collect(Collectors.toMap(d -> d.getProduct().getProductId(), d -> d));

        int totalPrice = 0;

        // 요청에 있는 상품 처리 (수정 or 신규)
        for (Map.Entry<Integer, Integer> e : requestedQty.entrySet()) {
            int productId = e.getKey();
            int newQty = e.getValue();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ServiceException(ErrorCode.PRODUCT_NOT_FOUND));

            OrdersDetail existing = current.remove(productId); // 처리된 기존 상품은 current에서 제거

            if (existing != null) {
                // 수정: 수량 차이만큼 재고 증감, 금액 갱신
                int oldQty = existing.getOrderQuantity();
                int diff = newQty - oldQty;

                if (diff > 0) { // 수량 증가 → 재고 차감
                    if (product.getQuantity() < diff) {
                        throw new ServiceException(ErrorCode.ORDER_PRODUCT_STOCK_SHORTAGE);
                    }
                    product.setQuantity(product.getQuantity() - diff);
                } else if (diff < 0) { // 수량 감소 → 재고 복원
                    product.setQuantity(product.getQuantity() + (-diff));
                }
                productRepository.save(product);

                existing.setOrderQuantity(newQty);
                existing.setPrice(product.getProductPrice() * newQty); // 기존 상품 id 유지
                totalPrice += existing.getPrice();

            } else {
                // 재고 차감
                if (product.getQuantity() < newQty) {
                    throw new ServiceException(ErrorCode.ORDER_PRODUCT_STOCK_SHORTAGE);
                }
                product.setQuantity(product.getQuantity() - newQty);

                OrdersDetail orderDetail = new OrdersDetail();
                orderDetail.setProduct(product);
                orderDetail.setOrderQuantity(newQty);
                orderDetail.setPrice(product.getProductPrice() * newQty);
                order.addDetail(orderDetail);

                totalPrice += orderDetail.getPrice();
            }
        }

        // 요청에 빠진 기존 상품 삭제 + 재고 복원
        for (OrdersDetail toRemove : current.values()) {
            Product product = toRemove.getProduct();
            product.setQuantity(product.getQuantity() + toRemove.getOrderQuantity());
            order.removeDetail(toRemove);
        }

        // 주소/우편번호/총액 수정
        if (address != null) order.setAddress(address);
        if (zipCode != null) order.setZipCode(zipCode);
        order.setTotalPrice(totalPrice);

        return ordersRepository.save(order);
    }


    public void deleteOrders(Orders orders) {
        // 상태 기반 취소 가능 여부 확인
        if (!orders.getStatus().isCustomerModifiable()) {
            throw new ServiceException(ErrorCode.ORDER_NOT_MODIFIABLE);
        }

        if (OrderStatus.CANCELLED.equals(orders.getStatus())) {
            throw new ServiceException(ErrorCode.ORDER_ALREADY_CANCELLED);
        }

        // 재고 원복
        for (OrdersDetail detail : orders.getOrderDetails()) {
            Product product = detail.getProduct();
            product.setQuantity(product.getQuantity() + detail.getOrderQuantity());
        }

        // 주문 상태 변경
        orders.setStatus(OrderStatus.CANCELLED);
        ordersRepository.save(orders);
    }


    // 주문 수정/취소 가능 여부 확인
    public boolean canModifyOrder(Orders order) {
        return order.getStatus().isCustomerModifiable();
    }

    // 14시 기준 주문 자동 확정 처리
    public void confirmPendingOrders() {
        List<Orders> pendingOrders = ordersRepository.findByStatus(OrderStatus.PENDING);

        for (Orders order : pendingOrders) {
            order.setStatus(OrderStatus.CONFIRMED);
            ordersRepository.save(order);
        }
    }
}
