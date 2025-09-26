package com.backend.domain.product.dto;

import com.backend.domain.product.entity.Product;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailResponseDto {

    private Integer productId;
    private String productName;
    private int productPrice;
    private String description;
    private int quantity;
    private String imageUrl;

    public static ProductDetailResponseDto fromEntity(Product product) {
        return ProductDetailResponseDto.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .productPrice(product.getProductPrice())
                .description(product.getDescription())
                .quantity(product.getQuantity())
                .imageUrl(product.getImageUrl())
                .build();
    }
}
