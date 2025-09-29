package com.backend.domain.admin.service;

import com.backend.domain.admin.dto.AdminDto;
import com.backend.domain.admin.entity.Post;
import com.backend.domain.admin.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    @Transactional
    public Post create(AdminDto adminDto) {
        return postRepository.save(adminDto.toEntity());
    }

@Transactional
public Post create(String product_Name, Integer product_price, Integer quantity, String image_Url, String description) {
    AdminDto adminDto = new AdminDto(null, product_Name, product_price, quantity, image_Url, description);
    return create(adminDto);
}

    @Transactional
    public Post update(Long id, AdminDto adminDto) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        post.update(
                adminDto.product_name(),
                adminDto.product_price(),
                adminDto.quantity(),
                adminDto.image_url(),
                adminDto.description()
        );
        return post;
    }

    @Transactional
    public void delete(Long id) {
        postRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Post findById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Post> findAll() {
        return postRepository.findAll();
    }

    @Transactional(readOnly = true)
    public long count() {
        return postRepository.count();
    }


}