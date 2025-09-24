package com.backend.domain.product.service;

import com.backend.domain.product.entity.Product;
import com.backend.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Long count() {
        return productRepository.count();
    }

    public Product addProduct(String name, int price, int quantity, String description, String imageUrl) {
        Product newProduct = Product.builder()
                .name(name)
                .price(price)
                .quantity(quantity)
                .description(description)
                .imageUrl(imageUrl)
                .build();

        return productRepository.save(newProduct);
    }
}
