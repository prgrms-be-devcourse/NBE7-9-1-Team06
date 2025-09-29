package com.backend.domain.order.scheduler;

import com.backend.domain.order.service.OrdersService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrdersScheduler {

    private final OrdersService ordersService;
    /**
     * 매일 14:00에 PENDING 상태의 주문들을 CONFIRMED로 변경
     * cron: 초(0) 분(0) 시(14) 일(*) 월(*) 요일(*)
     */
    @Scheduled(cron = "0 0 14 * * *")
    @Transactional
    public void confirmPendingOrders() {
        log.info("14시 주문 확정 스케줄러 시작");

        ordersService.confirmPendingOrders();

        log.info("14시 주문 확정 스케줄러 완료");
    }

    // 테스트용 코드
    //@Scheduled(fixedRate = 60000) // 1분마다 실행
    @Transactional
    public void confirmPendingOrdersForTest() {
        log.info("[테스트] 주문 확정 스케줄러 실행");

        // OrdersService의 confirmPendingOrders 메서드 호출
        ordersService.confirmPendingOrders();

        log.info("[테스트] 주문 확정 스케줄러 완료");

    }
}