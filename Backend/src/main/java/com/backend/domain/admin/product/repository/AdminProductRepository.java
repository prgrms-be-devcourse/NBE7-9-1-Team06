package com.backend.domain.admin.product.repository;

import com.backend.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminProductRepository extends JpaRepository<Product, Integer> {
}
