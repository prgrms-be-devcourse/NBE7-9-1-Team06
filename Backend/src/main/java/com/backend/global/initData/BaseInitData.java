package com.backend.global.initData;


import com.backend.domain.admin.auth.entity.Admin;
import com.backend.domain.admin.auth.service.AdminAuthService;
import com.backend.domain.order.service.OrdersService;
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

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

    @Autowired
    @Lazy
    private BaseInitData self;
    private final ProductService productService;
    private final OrdersService ordersService;
    private final AdminAuthService adminAuthService;


    @Autowired
    private ProductRepository productRepository;

    @Bean
    ApplicationRunner initDataRunner() {
        return args -> {
            self.work1();
            self.work2();
            self.work3();
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

    @Transactional
    public void work2() {

        if(adminAuthService.count() > 0) {
            return;
        }

        Admin admin = adminAuthService.join("admin", "1234");

    }

//    @Transactional
//    public void work3() {
//        if (ordersService.count() > 0) {
//            return;
//        }
//
//        // 주문 1: 콜롬비아 나리노 3개, 브라질 세하도 2개
//        List<OrdersService.OrderItem> orderItems1 = List.of(
//            new OrdersService.OrderItem(1, 3),
//            new OrdersService.OrderItem(2, 2)
//        );
//        ordersService.createOrders(
//            "customer1@test.com",
//            "서울시 강남구 역삼동 123-45",
//            12345,
//            orderItems1
//        );
//
//        // 주문 2: 콜롬비아 퀸디오 2개, 에티오피아 시다모 1개
//        List<OrdersService.OrderItem> orderItems2 = List.of(
//            new OrdersService.OrderItem(3, 2),
//            new OrdersService.OrderItem(4, 1)
//        );
//        ordersService.createOrders(
//            "customer2@test.com",
//            "서울시 서초구 서초동 456-78",
//            23456,
//            orderItems2
//        );
//
//        // 주문 3: 모든 상품 1개씩
//        List<OrdersService.OrderItem> orderItems3 = List.of(
//            new OrdersService.OrderItem(1, 1),
//            new OrdersService.OrderItem(2, 1),
//            new OrdersService.OrderItem(3, 1),
//            new OrdersService.OrderItem(4, 1)
//        );
//        ordersService.createOrders(
//            "customer3@test.com",
//            "서울시 마포구 합정동 789-12",
//            34567,
//            orderItems3
//        );
//    }

    @Transactional
    public void work3() {
        if (ordersService.count() > 0) {
            return;
        }

        List<OrdersService.OrderItem> orderItems1 = List.of(new OrdersService.OrderItem(1, 3), new OrdersService.OrderItem(2, 2));
        ordersService.createOrders("customer1@test.com", "서울시 강남구 역삼동 123-45", 12345, orderItems1);

        List<OrdersService.OrderItem> orderItems2 = List.of(new OrdersService.OrderItem(3, 2), new OrdersService.OrderItem(4, 1));
        ordersService.createOrders("customer2@test.com", "서울시 서초구 서초동 456-78", 23456, orderItems2);

        List<OrdersService.OrderItem> orderItems3 = List.of(new OrdersService.OrderItem(1, 1), new OrdersService.OrderItem(2, 1), new OrdersService.OrderItem(3, 1), new OrdersService.OrderItem(4, 1));
        ordersService.createOrders("customer3@test.com", "서울시 마포구 합정동 789-12", 34567, orderItems3);

        // --- 합배송 테스트를 위한 주문 데이터 추가 ---
        // 가상의 합배송 고객
        String mergeableCustomerEmail = "mergeable@test.com";

        ordersService.createOrders(
                mergeableCustomerEmail,
                "서울시 강남구 합배송로 100",
                11111,
                List.of(new OrdersService.OrderItem(1, 1))
        );

        ordersService.createOrders(
                mergeableCustomerEmail,
                "서울시 강남구 합배송로 100",
                11111,
                List.of(new OrdersService.OrderItem(2, 1))
        );

        ordersService.createOrders(
                mergeableCustomerEmail,
                "서울시 강남구 합배송로 100",
                11111,
                List.of(new OrdersService.OrderItem(3, 1))
        );

        ordersService.createOrders(
                "non-mergeable@test.com",
                "서울시 강남구 제외로 200",
                22222,
                List.of(new OrdersService.OrderItem(4, 1))
        );
    }
}
