package com.backend.global.config;

import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@MappedSuperclass
@Getter
@EntityListeners(AuditingEntityListener.class)

public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private Integer product_id;
    private Integer product_price;
    private Integer quantity;
    private String product_name;
    private String image_url;
    private String description;
}