package com.backend.domain.order.service;

import com.backend.domain.order.entity.OrderStatus;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.entity.OrdersDetail;
import com.backend.domain.order.repository.OrdersDetailRepository;
import com.backend.domain.order.repository.OrdersRepository;
import com.backend.domain.product.entity.Product;
import com.backend.domain.product.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrdersService {
    private final OrdersRepository ordersRepository;
    private final OrdersDetailRepository ordersDetailRepository;
    private final ProductRepository productRepository;
    private static final LocalTime CUTOFF_TIME = LocalTime.of(14, 0); // 14:00 컷오프

    // 주문 아이템 record
    public record OrderItem(int productId, int quantity) {}

    public Optional<Orders> findById(int id) {
        return ordersRepository.findById(id);
    }

    @Transactional
    public void deleteOrders(Orders orders) {
        if (!canModifyOrder(orders.getOrderDate())) {
            throw new IllegalStateException("14시 이후 주문은 취소할 수 없습니다.");
        }

        if (OrderStatus.CANCELLED.equals(orders.getStatus())) {
            throw new IllegalStateException("이미 취소된 주문입니다.");
        }

        // 주문 상태 변경
        orders.setStatus(OrderStatus.CANCELLED);
        ordersRepository.save(orders);
    }

    public Orders createOrders(String email, String address, int zipCode, List<OrderItem> items) {
        // 주문 엔티티 생성
        Orders order = new Orders();
        order.setEmail(email);
        order.setAddress(address);
        order.setZipCode(zipCode);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        // 주문 저장 (ID 생성을 위해)
        Orders savedOrder = ordersRepository.save(order);

        // orderDetails 리스트 초기화
        savedOrder.setOrderDetails(new ArrayList<>());

        // 총 가격 계산 및 주문 상세 생성
        int totalPrice = 0;
        for (OrderItem item : items) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + item.productId()));

            // 재고 확인
            if (product.getQuantity() < item.quantity()) {
                throw new IllegalArgumentException("재고가 부족합니다: " + product.getProductName());
            }

            // 주문 상세 생성
            OrdersDetail orderDetail = new OrdersDetail();
            orderDetail.setOrders(savedOrder);
            orderDetail.setProduct(product);
            orderDetail.setOrderQuantity(item.quantity());
            orderDetail.setPrice(product.getProductPrice() * item.quantity());
            OrdersDetail savedOrderDetail = ordersDetailRepository.save(orderDetail);

            // 양방향 관계 설정
            savedOrder.getOrderDetails().add(savedOrderDetail);

            // 재고 차감
            product.setQuantity(product.getQuantity() - item.quantity());
            productRepository.save(product);

            totalPrice += orderDetail.getPrice();
        }

        // 총 가격 업데이트
        savedOrder.setTotalPrice(totalPrice);
        return ordersRepository.save(savedOrder);
    }


    //14시 기준 수정/취소 가능 여부 확인
    public boolean canModifyOrder(LocalDateTime orderDate) {
        LocalDateTime today14 = LocalDateTime.now().with(CUTOFF_TIME);

        // 오늘 14시 이전에 주문했고, 현재 시간이 오늘 14시 이전이면 수정 가능
        if (orderDate.toLocalDate().equals(LocalDateTime.now().toLocalDate())) {
            return LocalDateTime.now().isBefore(today14);
        }

        // 과거 주문은 수정 불가
        return false;
    }
}
