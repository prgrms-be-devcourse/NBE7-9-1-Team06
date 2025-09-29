//package com.backend.domain.admin.dto;
//
//import com.backend.domain.admin.entity.Post;
//
//public record AdminDto (
//    Long id,
//    String product_name,
//    Integer product_price,
//    Integer quantity,
//    String image_url,
//    String description
//){
//    public AdminDto(Post post){
//        this(
//                post.getId(),
//                post.getProduct_name(),
//                post.getProduct_price(),
//                post.getQuantity(),
//                post.getImage_url(),
//                post.getDescription()
//        );
//    }
//    public Post toEntity() {
//        return new Post(product_name, product_price, quantity, image_url, description);
//    }
//}