package com.backend.domain.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private int id;

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
    private String status;

    // OrderDetails 엔티티와의 관계 (1:N)
    // @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    //private List<OrderDetails> orderDetails = new ArrayList<>();
}
