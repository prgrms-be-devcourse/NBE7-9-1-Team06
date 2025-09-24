package com.backend.domain.order.service;

import com.backend.domain.order.entity.Orders;
import com.backend.domain.order.repository.OrdersRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrdersService {
    private final OrdersRepository ordersRepository;

    public Optional<Orders> findById(int id) {
        return ordersRepository.findById(id);
    }

    @Transactional
    public void deleteOrders(Orders orders) {
        ordersRepository.delete(orders);
    }
}
