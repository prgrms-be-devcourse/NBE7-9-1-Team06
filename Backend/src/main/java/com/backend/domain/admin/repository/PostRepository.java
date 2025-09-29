package com.backend.domain.product.repository;

import com.backend.domain.product.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}