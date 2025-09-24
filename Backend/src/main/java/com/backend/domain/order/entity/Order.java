package com.backend.domain.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Entity
@Table(name = "orders")
public class Order {
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
}
