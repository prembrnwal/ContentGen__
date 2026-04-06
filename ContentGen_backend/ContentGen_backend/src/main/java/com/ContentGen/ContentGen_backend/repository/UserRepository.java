package com.ContentGen.ContentGen_backend.repository;

import com.ContentGen.ContentGen_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
}
