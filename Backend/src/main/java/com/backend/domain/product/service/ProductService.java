package com.backend.domain.product.service;

import com.backend.domain.product.dto.ProductDetailResponseDto;
import com.backend.domain.product.dto.ProductResponseDto;
import com.backend.domain.product.entity.Product;
import com.backend.domain.product.repository.ProductRepository;
import com.backend.global.exception.ErrorCode;
import com.backend.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // 전체 상품 목록 조회
    public List<ProductResponseDto> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 상품 상세 조회
    public ProductDetailResponseDto getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ServiceException(ErrorCode.PRODUCT_NOT_FOUND));
        return ProductDetailResponseDto.fromEntity(product);
    }
}
