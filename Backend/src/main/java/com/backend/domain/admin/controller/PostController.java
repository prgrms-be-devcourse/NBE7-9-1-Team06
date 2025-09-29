package com.backend.domain.admin.controller;

import com.backend.domain.admin.dto.AdminDto;
import com.backend.domain.admin.entity.Post;
import com.backend.domain.admin.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping("/write")
    public ResponseEntity<String> createProduct(@RequestBody AdminDto adminDto) {
        postService.create(adminDto);
        return ResponseEntity.ok("상품이 등록되었습니다.");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable Long id, @RequestBody AdminDto adminDto) {
        postService.update(id, adminDto);
        return ResponseEntity.ok("상품 정보가 수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.ok("상품이 상품 목록에서 지워졌습니다.");
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminDto> getProduct(@PathVariable Long id) {
        Post post = postService.findById(id);
        return ResponseEntity.ok(new AdminDto(post));
    }

    @GetMapping
    public ResponseEntity<List<AdminDto>> getAllProducts() {
        List<Post> posts = postService.findAll();
        List<AdminDto> dtos = posts.stream().map(AdminDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}