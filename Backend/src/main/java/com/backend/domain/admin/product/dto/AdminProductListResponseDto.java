package com.backend.domain.admin.product.dto;

//관리자 목록 조회 응답
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AdminProductListResponseDto {
    private List<AdminProductResponseDto> products;
}
