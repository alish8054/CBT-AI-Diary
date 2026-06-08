package com.diploma.backend.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "psychologist_requests")
@Data
public class PsychologistRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnoreProperties({"password", "psychologist"})
    private User client;

    @ManyToOne
    @JoinColumn(name = "psychologist_id", nullable = false)
    @JsonIgnoreProperties({"password", "psychologist"})
    private User psychologist;

    private String status = "PENDING";

    private LocalDateTime createdAt = LocalDateTime.now();
}
