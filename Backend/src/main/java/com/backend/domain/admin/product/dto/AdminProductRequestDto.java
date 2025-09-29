package com.backend.domain.admin.product.dto;

// 관리자 상품 등록 & 수정
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminProductRequestDto {
    private String productName;
    private int productPrice;
    private int quantity;
    private String description;
    private String imageUrl;
}