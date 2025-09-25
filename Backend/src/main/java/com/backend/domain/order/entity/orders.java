package com.backend.domain.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ORDERS")
@Getter
@Setter
@NoArgsConstructor
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String address;

    @Column(name = "zip_code", nullable = false)
    private Integer zipCode;

    @Column(name = "total_price", nullable = false)
    private Integer totalPrice;

    private LocalDateTime orderDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    // OrderDetails 엔티티와의 관계 (1:N)
    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrdersDetail> orderDetails;

    @PrePersist
    void prePersist() {
        if (orderDate == null) orderDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = OrderStatus.PENDING;
        }
        if (totalPrice == null) totalPrice = 0;
    }

    public void addDetail(OrdersDetail d) {
        orderDetails.add(d);
        d.setOrders(this);
    }

    public void removeDetail(OrdersDetail d) {
        orderDetails.remove(d);
        d.setOrders(null);
    }

    public void clearDetails() {
        for (OrdersDetail d : orderDetails) d.setOrders(null);
        orderDetails.clear();
    }
}
