package com.backend.domain.product.service;

import com.backend.domain.product.entity.Post;
import com.backend.domain.product.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    public Post write(String product_name, Integer product_price, Integer quantity, String image_url, String description) {
        Post post = new Post(product_name, product_price, quantity, image_url, description);
        return postRepository.save(post);
    }

    public long count() {
        return postRepository.count();
    }

    public Optional<Post> findById(Long id) {
        return postRepository.findById(id);
    }

    public List<Post> findAll() {
        return postRepository.findAll();
    }

    public void modify(Post post, String product_name, Integer product_price, Integer quantity, String image_url, String description) {
        post.update(product_name, product_price, quantity, image_url, description);
    }

    public void delete(Post post) {
        postRepository.delete(post);
    }
}