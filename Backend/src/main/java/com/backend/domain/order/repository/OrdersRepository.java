package com.backend.domain.order.repository;

import com.backend.domain.order.entity.OrderStatus;
import com.backend.domain.order.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Integer> {
    List<Orders> findByEmailOrderByOrderDateDesc(String email);

    List<Orders> findByStatus(OrderStatus orderStatus);
}
