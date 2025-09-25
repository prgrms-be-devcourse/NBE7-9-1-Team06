package com.backend.domain.order.entity;

import com.backend.domain.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ORDERS_DETAIL")
@Getter
@Setter
@NoArgsConstructor
public class OrdersDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_detail_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Orders orders;

    @Column(name = "order_quantity", nullable = false)
    private Integer orderQuantity;

    @Column(name = "price", nullable = false)
    private Integer price;
}
