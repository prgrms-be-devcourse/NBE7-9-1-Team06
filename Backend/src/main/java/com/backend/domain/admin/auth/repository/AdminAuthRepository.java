package com.backend.domain.admin.auth.repository;

import com.backend.domain.admin.auth.entity.Admin;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminAuthRepository extends CrudRepository<Admin, Integer> {

    Optional<Admin> findByUsername(String username);

}
