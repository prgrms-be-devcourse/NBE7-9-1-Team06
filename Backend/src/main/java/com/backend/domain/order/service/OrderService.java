package com.backend.domain.order.service;

import com.backend.domain.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public Long count() {
        return orderRepository.count();
    }
}
