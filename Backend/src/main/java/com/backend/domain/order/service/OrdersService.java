package com.backend.domain.order.service;

import com.backend.domain.order.entity.OrderStatus;
import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.entity.OrdersDetail;
import com.backend.domain.order.repository.OrdersDetailRepository;
import com.backend.domain.order.repository.OrdersRepository;
import com.backend.domain.product.entity.Product;
import com.backend.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrdersService {
    private final OrdersRepository ordersRepository;
    private final OrdersDetailRepository ordersDetailRepository;
    private final ProductRepository productRepository;
    private static final LocalTime CUTOFF_TIME = LocalTime.of(14, 0); // 14:00 컷오프

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


    // 이메일로 주문 목록 조회
    @Transactional(readOnly = true)
    public List<Orders> findByEmail(String email) {
        List<Orders> orders = ordersRepository.findByEmailOrderByOrderDateDesc(email);
        // Lazy Loading 강제 초기화
        for (Orders order : orders) {
            order.getOrderDetails().size(); // 강제 로딩
        }
        return orders;
    }

    // ID로 주문 조회
    @Transactional(readOnly = true)
    public Optional<Orders> findById(int id) {
        Optional<Orders> order = ordersRepository.findById(id);
        if (order.isPresent()) {
            // Lazy Loading 강제 초기화
            order.get().getOrderDetails().size();
        }
        return order;
    }


    @Transactional
    public Orders updateOrders(int orderId, String address, Integer zipCode, List<OrderItem> items) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다: " + orderId));

        // 14시 이후 수정 불가 체크
        if (!canModifyOrder(order.getOrderDate())) {
            throw new IllegalStateException("14시 이후에는 주문을 수정할 수 없습니다.");
        }

        if (!order.getStatus().isCustomerModifiable()) {
            throw new IllegalStateException("진행 중인 주문은 수정할 수 없습니다.");
        }

        // 요청 아이템 productId별 합산(중복 productId 방지)
        Map<Integer, Integer> requestedQty = new LinkedHashMap<>();
        for (OrderItem item : items) {
            if (item.quantity() <= 0) throw new IllegalArgumentException("수량은 1 이상이어야 합니다.");
            requestedQty.merge(item.productId(), item.quantity(), Integer::sum);
        }

        Map<Integer, OrdersDetail> current = order.getOrderDetails().stream()
                .collect(Collectors.toMap(d -> d.getProduct().getId(), d -> d));

        int totalPrice = 0;

        // 요청에 있는 상품 처리 (수정 or 신규)
        for (Map.Entry<Integer, Integer> e : requestedQty.entrySet()) {
            int productId = e.getKey();
            int newQty = e.getValue();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + productId));

            OrdersDetail existing = current.remove(productId); // 처리된 기존 상품은 current에서 제거

            if (existing != null) {
                // 수정: 수량 차이만큼 재고 증감, 금액 갱신
                int oldQty = existing.getOrderQuantity();
                int diff = newQty - oldQty;

                if (diff > 0) { // 수량 증가 → 재고 차감
                    if (product.getQuantity() < diff) {
                        throw new IllegalArgumentException("재고가 부족합니다: " + product.getProductName());
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
                    throw new IllegalArgumentException("재고가 부족합니다: " + product.getProductName());
                }
                product.setQuantity(product.getQuantity() - newQty);
                productRepository.save(product);

                OrdersDetail orderDetail = new OrdersDetail();
                orderDetail.setOrders(order);
                orderDetail.setProduct(product);
                orderDetail.setOrderQuantity(newQty);
                orderDetail.setPrice(product.getProductPrice() * newQty);

                order.getOrderDetails().add(orderDetail);
                ordersDetailRepository.save(orderDetail);

                totalPrice += orderDetail.getPrice();
            }
        }

        // 요청에 빠진 기존 상품 삭제 + 재고 복원
        for (OrdersDetail toRemove : current.values()) {
            Product product = toRemove.getProduct();
            product.setQuantity(product.getQuantity() + toRemove.getOrderQuantity());
            productRepository.save(product);

            order.getOrderDetails().remove(toRemove);
            toRemove.setOrders(null);
        }

        // 주소/우편번호/총액 수정
        if (address != null) order.setAddress(address);
        if (zipCode != null) order.setZipCode(zipCode);
        order.setTotalPrice(totalPrice);

        return ordersRepository.save(order);
    }


    public void deleteOrders(Orders orders) {
        if (!canModifyOrder(orders.getOrderDate())) {
            throw new IllegalStateException("14시 이후에는 주문을 취소할 수 없습니다.");
        }

        if (OrderStatus.CANCELLED.equals(orders.getStatus())) {
            throw new IllegalStateException("이미 취소된 주문입니다.");
        }

        // 재고 원복
        for (OrdersDetail detail : orders.getOrderDetails()) {
            Product product = detail.getProduct();
            product.setQuantity(product.getQuantity() + detail.getOrderQuantity());
            productRepository.save(product);
        }

        // 주문 상태 변경
        orders.setStatus(OrderStatus.CANCELLED);
        ordersRepository.save(orders);
    }


    // 14시 기준 수정/취소 가능 여부 확인
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
