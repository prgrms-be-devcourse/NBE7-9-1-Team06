package com.backend.global.initData;


import com.backend.domain.order.service.OrderService;
import com.backend.domain.product.entity.Product;
import com.backend.domain.product.repository.ProductRepository;
import com.backend.domain.product.service.ProductService;
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
    private final ProductService productService;
    private final OrderService orderService; // This is the instance
    @Autowired
    private ProductRepository productRepository;

    @Bean
    ApplicationRunner initDataRunner() {
        return args -> {

            self.work1();

        };
    }

    @Transactional
    public void work1() {

        if(productService.count() > 0) {
            return;
        }

        Product product1 = productService.addProduct(
                "Colombia Narino",
                5000,
                20,
                "콜롬비아 나리노 원두",
                "https://example.com/images/colombia-narino.jpg"
                );
        productRepository.save(product1);

        Product product2 = productService.addProduct(
                "Brazil Serra Do Caparaó",
                6000,
                20,
                "브라질 세하도 카파라오 원두",
                "https://example.com/images/brazil-serra.jpg"
        );
        productRepository.save(product2);

        Product product3 = productService.addProduct(
                "Colombia Quindio (White Wine Extended)",
                7000,
                20,
                "콜롬비아 퀸디오 원두",
                "https://example.com/images/colombia-quindio.jpg"
        );
        productRepository.save(product3);

        Product product4 = productService.addProduct(
                "Ethiopia Sidamo",
                8000,
                20,
                "에티오피아 시다모 원두",
                "https://example.com/images/ethiopia-sidamo.jpg"
        );
        productRepository.save(product4);
    }
}
