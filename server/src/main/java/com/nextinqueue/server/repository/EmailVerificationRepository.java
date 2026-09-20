package com.nextinqueue.server.repository;

import com.nextinqueue.server.model.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface EmailVerificationRepository
        extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findTopByEmailAndPurposeOrderByIdDesc(
            String email,
            String purpose);

    @Modifying
    @Transactional
    void deleteByEmailAndPurpose(String email, String purpose);

    @Modifying
    @Transactional
    void deleteByEmail(String email);
}
