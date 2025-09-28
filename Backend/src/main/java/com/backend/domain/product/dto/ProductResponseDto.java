package com.backend.domain.product.dto;

import com.backend.domain.product.entity.Product;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDto {

    private Integer productId;
    private String productName;
    private int productPrice;
    private int quantity;
    private String imageUrl;

    public static ProductResponseDto fromEntity(Product product) {
        return ProductResponseDto.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .productPrice(product.getProductPrice())
                .quantity(product.getQuantity())
                .imageUrl(product.getImageUrl())
                .build();
    }
}

