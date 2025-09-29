package com.backend.domain.admin.product.service;

import com.backend.domain.admin.product.dto.*;
import com.backend.domain.admin.product.repository.AdminProductRepository;
import com.backend.domain.product.entity.Product;
import com.backend.global.exception.ErrorCode;
import com.backend.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final AdminProductRepository productRepository;

    // 상품 등록
    public AdminProductResponseDto createProduct(AdminProductRequestDto request) {
        try {
            Product product = Product.builder()
                    .productName(request.getProductName())
                    .productPrice(request.getProductPrice())
                    .quantity(request.getQuantity())
                    .description(request.getDescription())
                    .imageUrl(request.getImageUrl())
                    .build();

            return AdminProductResponseDto.fromEntity(productRepository.save(product));
        } catch (Exception e) {
            throw new ServiceException(ErrorCode.PRODUCT_CREATE_FAILED);
        }
    }

    // 상품 수정
    public AdminProductResponseDto updateProduct(Integer productId, AdminProductRequestDto request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ServiceException(ErrorCode.PRODUCT_NOT_FOUND));

        try {
            product.setProductName(request.getProductName());
            product.setProductPrice(request.getProductPrice());
            product.setQuantity(request.getQuantity());
            product.setDescription(request.getDescription());
            product.setImageUrl(request.getImageUrl());

            return AdminProductResponseDto.fromEntity(productRepository.save(product));
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException(ErrorCode.PRODUCT_UPDATE_FAILED);
        }
    }

    // 상품 삭제
    public void deleteProduct(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ServiceException(ErrorCode.PRODUCT_NOT_FOUND));

        try {
            productRepository.delete(product);
        } catch (Exception e) {
            throw new ServiceException(ErrorCode.PRODUCT_DELETE_FAILED);
        }
    }

    // 상품 목록 조회
    public AdminProductListResponseDto getAllProducts() {
        List<Product> products = productRepository.findAll();

        if (products.isEmpty()) {
            throw new ServiceException(ErrorCode.PRODUCT_LIST_EMPTY);
        }

        List<AdminProductResponseDto> productDtos = products.stream()
                .map(AdminProductResponseDto::fromEntity)
                .collect(Collectors.toList());

        return new AdminProductListResponseDto(productDtos);
    }
}
