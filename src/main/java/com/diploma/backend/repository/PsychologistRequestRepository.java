package com.diploma.backend.repository;

import com.diploma.backend.Entity.PsychologistRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PsychologistRequestRepository extends JpaRepository<PsychologistRequest, Long> {
    List<PsychologistRequest> findByPsychologistIdAndStatus(Long psychologistId, String status);

    List<PsychologistRequest> findByClientIdAndStatus(Long clientId, String status);

    Optional<PsychologistRequest> findByClientIdAndPsychologistIdAndStatus(Long clientId, Long psychologistId, String status);
}
