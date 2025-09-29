package com.backend.domain.admin.product.controller;

import com.backend.domain.admin.product.dto.*;
import com.backend.domain.admin.product.service.AdminProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService productService;

    // 상품 등록
    @PostMapping
    public ResponseEntity<AdminProductResponseDto> createProduct(@RequestBody AdminProductRequestDto request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    // 상품 수정
    @PutMapping("/{productId}")
    public ResponseEntity<AdminProductResponseDto> updateProduct(
            @PathVariable Integer productId,
            @RequestBody AdminProductRequestDto request) {
        return ResponseEntity.ok(productService.updateProduct(productId, request));
    }

    // 상품 삭제
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.noContent().build();
    }

    // 상품 목록 조회
    @GetMapping
    public ResponseEntity<AdminProductListResponseDto> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
}
