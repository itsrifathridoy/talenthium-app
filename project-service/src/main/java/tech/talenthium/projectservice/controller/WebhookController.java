package tech.talenthium.projectservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tech.talenthium.projectservice.service.WebhookService;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class WebhookController {
    private final ObjectMapper mapper = new ObjectMapper();
    private final WebhookService webhookService;
    
    @Value("${github.webhook-secret}") private String webhookSecret;

    @PostMapping("/github")
    public ResponseEntity<String> handleWebhook(HttpServletRequest request,
                                                @RequestHeader("X-Hub-Signature-256") String signature,
                                                @RequestHeader("X-GitHub-Event") String event) throws IOException {
        byte[] bodyBytes = request.getInputStream().readAllBytes();
        String payload = new String(bodyBytes, StandardCharsets.UTF_8);

        // Verify webhook signature
        if (!verifySignature(payload, signature, webhookSecret)) {
            log.warn("Invalid webhook signature received for event: {}", event);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        log.info("=".repeat(80));
        log.info("Received GitHub webhook event: {}", event);
        log.info("=".repeat(80));

        try {
            JsonNode json = mapper.readTree(payload);
            
            // Log the full payload for debugging
            log.debug("Webhook payload: {}", mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json));

            // Handle different webhook events
            switch (event) {
                case "push" -> {
                    log.info("Handling push event");
                    webhookService.handlePush(json);
                }
                case "installation" -> {
                    String action = json.path("action").asText();
                    log.info("Handling installation event - Action: {}", action);
                    
                    if ("created".equals(action)) {
                        webhookService.handleInstallationCreated(json);
                    } else if ("deleted".equals(action)) {
                        webhookService.handleInstallationDeleted(json);
                    } else {
                        log.info("Unhandled installation action: {}", action);
                    }
                }
                case "installation_repositories" -> {
                    String action = json.path("action").asText();
                    log.info("Handling installation_repositories event - Action: {}", action);
                    webhookService.handleInstallationRepositories(json);
                }
                default -> {
                    log.info("Received unhandled webhook event: {}", event);
                }
            }

            log.info("Successfully processed {} event", event);
            return ResponseEntity.ok("ok");

        } catch (Exception e) {
            log.error("Error processing webhook event {}: {}", event, e.getMessage(), e);
            // Still return 200 to acknowledge receipt (GitHub will retry on 5xx errors)
            return ResponseEntity.ok("error");
        }
    }

    private boolean verifySignature(String payload, String signatureHeader, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(key);
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = "sha256=" + bytesToHex(digest);
            return MessageDigest.isEqual(expected.getBytes(), signatureHeader.getBytes());
        } catch (Exception e) {
            log.error("Error verifying webhook signature: {}", e.getMessage());
            return false;
        }
    }
    
    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}

