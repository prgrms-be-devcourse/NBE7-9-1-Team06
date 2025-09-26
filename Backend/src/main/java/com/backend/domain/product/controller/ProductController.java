package com.backend.domain.product.controller;

import com.backend.domain.product.dto.ProductResponseDto;
import com.backend.domain.product.dto.ProductDetailResponseDto;
import com.backend.domain.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // 전체 상품 목록 조회
    @GetMapping
    public ResponseEntity<List<ProductResponseDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // 상품 상세 조회
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDetailResponseDto> getProductById(@PathVariable("productId") Integer id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
}
