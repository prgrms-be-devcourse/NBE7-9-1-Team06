package com.backend.domain.order.repository;

import com.backend.domain.order.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Integer> {
    @Query("SELECT o FROM Orders o WHERE o.email = :email ORDER BY o.orderDate DESC")
    List<Orders> findByEmailOrderByOrderDateDesc(@Param("email") String email);

    @Query("SELECT o FROM Orders o JOIN FETCH o.orderDetails")
    List<Orders> findAllWithDetails();
}