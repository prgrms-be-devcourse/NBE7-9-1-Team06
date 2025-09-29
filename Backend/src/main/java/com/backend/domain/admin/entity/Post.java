package com.backend.domain.product.entity;

import com.backend.global.config.BaseEntity;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Post extends BaseEntity {

    private String product_name;
    private Integer product_price;
    private Integer quantity;
    private String image_url;
    private String description;

    public Post(String product_name, Integer product_price, Integer quantity, String image_url, String description) {
        this.product_name = product_name;
        this.product_price = product_price;
        this.quantity = quantity;
        this.image_url = image_url;
        this.description = description;
    }

    public void update(String product_name, Integer product_price, Integer quantity, String image_url, String description) {
        this.product_name = product_name;
        this.product_price = product_price;
        this.quantity = quantity;
        this.image_url = image_url;
        this.description = description;
    }
}