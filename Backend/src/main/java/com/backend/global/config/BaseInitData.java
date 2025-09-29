package com.backend.global.config;

import com.backend.domain.admin.service.PostService;
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

        postService.create("1번 커피", 5000, 10, "1번설명", "1번사진");
        postService.create("2번 커피", 5000, 10, "2번설명", "2번사진");
        postService.create("3번 커피", 5000, 10, "3번설명", "3번사진");
        postService.create("4번 커피", 5000, 10, "4번설명", "4번사진");
    }
}