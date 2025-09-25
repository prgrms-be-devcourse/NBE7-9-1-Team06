package com.backend.domain.order.entity;

public enum OrderStatus {
    PENDING("주문 대기"),        // 14시 이전, 고객이 수정/취소 가능
    CONFIRMED("주문 확정"),      // 14시 이후 확정, 관리자만 처리 가능
    PREPARING("제품 준비중"),     // 원두 포장 등 준비
    SHIPPED("배송중"),          // 배송 시작
    DELIVERED("배송 완료"),      // 최종 완료
    CANCELLED("주문 취소");      // 취소된 주문

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    // 주문 아이템 record
    public record OrderItem(int productId, int quantity) {}


    public String getDescription() {
        return description;
    }

    // 고객이 수정/취소 가능한 상태인지 확인
    public boolean isCustomerModifiable() {
        return this == PENDING;
    }

    // 관리자가 처리해야 하는 상태인지 확인
    public boolean isAdminProcessable() {
        return this == CONFIRMED || this == PREPARING || this == SHIPPED;
    }
}