package com.backend.domain.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public class ManagerDTO {

    @NotBlank(message = "01-제품 이름을 입력해주세요.")
    private String product_name;

    @NotNull(message = "02-상품 가격을 입력해주세요.")
    @Positive(message = "상품 가격은 양수여야 합니다.")
    private Integer product_price;

    @NotNull(message = "03-상품 재고를 입력해주세요.")
    @PositiveOrZero(message = "재고는 0 이상이어야 합니다.")
    private Integer quantity;

    @NotBlank(message = "04-이미지의 url을 입력해주세요.")
    private String image_url;

    @NotBlank(message = "05-상품의 상세를 입력해주세요.")
    private String description;
}