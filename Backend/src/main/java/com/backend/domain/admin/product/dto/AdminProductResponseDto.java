package com.backend.domain.admin.product.dto;

// 사용자 상품 조회 응답
import com.backend.domain.product.entity.Product;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminProductResponseDto {
    private Integer productId;
    private String productName;
    private int productPrice;
    private int quantity;
    private String description;
    private String imageUrl;

    public static AdminProductResponseDto fromEntity(Product product) {
        return AdminProductResponseDto.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .productPrice(product.getProductPrice())
                .quantity(product.getQuantity())
                .description(product.getDescription())
                .imageUrl(product.getImageUrl())
                .build();
    }
}
