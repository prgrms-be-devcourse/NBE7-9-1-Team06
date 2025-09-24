package com.backend.domain.product.repository;

import com.backend.domain.product.entity.Product;
import org.springframework.data.repository.CrudRepository;

public interface ProductRepository extends CrudRepository<Product, Integer> {
}
