package com.backend.global.config;

import com.backend.domain.product.entity.Post;
import com.backend.domain.product.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

    @Autowired
    @Lazy
    private BaseInitData self;

    private final PostService postService;

    @Bean
    ApplicationRunner initDataRunner() {
        return args -> self.work1();
    }

    @Transactional
    public void work1() {
        if(postService.count() > 0) return;

        postService.write("1번 커피", 5000, 10, "1번사진", "1번설명");
        postService.write("2번 커피", 5000, 10, "2번사진", "2번설명");
        postService.write("3번 커피", 5000, 10, "3번사진", "3번설명");
        postService.write("4번 커피", 5000, 10, "4번사진", "4번설명");
    }
}