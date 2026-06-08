package com.diploma.backend.controller;

import com.diploma.backend.Entity.PaymentTransaction;
import com.diploma.backend.security.AccessControlService;
import com.diploma.backend.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final AccessControlService accessControl;

    @PostMapping("/init")
    public ResponseEntity<?> initPayment(@RequestBody(required = false) Map<String, Long> payload, HttpServletRequest request) {
        PaymentTransaction tx = paymentService.createPayment(accessControl.currentUserId(request));
        return ResponseEntity.ok(Map.of(
                "orderId", tx.getOrderId(),
                "amount", tx.getAmount(),
                "qrData", "https://kaspi.kz/pay/" + tx.getOrderId()
        ));
    }

    @PostMapping("/webhook/success")
    public ResponseEntity<?> webhookSuccess(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        String orderId = payload.get("orderId");
        paymentService.processSuccessWebhook(orderId, accessControl.currentUserId(request));
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/check/{orderId}")
    public ResponseEntity<?> checkStatus(@PathVariable String orderId, HttpServletRequest request) {
        String status = paymentService.checkStatus(orderId, accessControl.currentUserId(request));
        return ResponseEntity.ok(Map.of("status", status));
    }
}