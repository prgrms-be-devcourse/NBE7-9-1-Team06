package com.backend.global.initData;

import com.backend.domain.order.service.OrdersService;
import com.backend.domain.product.entity.Product;
import com.backend.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

    @Autowired
    @Lazy
    private BaseInitData self;
    private final ProductRepository productRepository;
    private final OrdersService ordersService;


    @Bean
    ApplicationRunner initDataRunner() {
        return args -> {
            self.work1();
            self.work2();

        };
    }

    @Transactional
    public void work1() {

        if(productRepository.count() > 0) {
            return;
        }

        productRepository.save(make(
                "Colombia Narino", 5000, 20,
                "콜롬비아 나리노 원두",
                "https://example.com/images/colombia-narino.jpg"
        ));
        productRepository.save(make(
                "Brazil Serra Do Caparaó", 6000, 20,
                "브라질 세하도 카파라오 원두",
                "https://example.com/images/brazil-serra.jpg"
        ));
        productRepository.save(make(
                "Colombia Quindio (White Wine Extended)", 7000, 20,
                "콜롬비아 퀸디오 원두",
                "https://example.com/images/colombia-quindio.jpg"
        ));
        productRepository.save(make(
                "Ethiopia Sidamo", 8000, 20,
                "에티오피아 시다모 원두",
                "https://example.com/images/ethiopia-sidamo.jpg"
        ));
    }

    @Transactional
    public void work2() {
        if(ordersService.count() > 0) {
            return;
        }

        List<Product> products = productRepository.findAll();

        Product p1 = products.get(0);
        Product p2 = products.get(1);
        Product p3 = products.get(2);

        ordersService.createOrders(
                "aaa@naver.com",
                "서울시 강남구",
                12345,
                List.of(
                        new OrdersService.OrderItem(p1.getProductId(), 2),
                        new OrdersService.OrderItem(p2.getProductId(), 1)
                )
        );

        ordersService.createOrders(
                "bbb@naver.com",
                "서울시 종로구",
                54321,
                List.of(
                        new OrdersService.OrderItem(p1.getProductId(), 1)
                )
        );

        ordersService.createOrders(
                "aaa@naver.com",
                "서울시 마포구",
                11223,
                List.of(
                        new OrdersService.OrderItem(p2.getProductId(), 2)
                )
        );

    }

    private Product make(String name, Integer price, Integer qty, String desc, String imageUrl) {
        Product p = new Product();
        p.setProductName(name);
        p.setProductPrice(price);
        p.setQuantity(qty);
        p.setDescription(desc);
        p.setImageUrl(imageUrl);
        return p;
    }
}