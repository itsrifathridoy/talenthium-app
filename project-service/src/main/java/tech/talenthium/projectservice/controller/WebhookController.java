package tech.talenthium.projectservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/webhooks")
public class WebhookController {
    private final ObjectMapper mapper = new ObjectMapper();
    @Value("${github.webhook-secret}") private String webhookSecret;

    @PostMapping("/github")
    public ResponseEntity<String> handleWebhook(HttpServletRequest request,
                                                @RequestHeader("X-Hub-Signature-256") String signature,
                                                @RequestHeader("X-GitHub-Event") String event) throws IOException {
        byte[] bodyBytes = request.getInputStream().readAllBytes();
        String payload = new String(bodyBytes, StandardCharsets.UTF_8);

        if (!verifySignature(payload, signature, webhookSecret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        JsonNode json = mapper.readTree(payload);
        if ("push".equals(event)) {
            handlePushEvent(json);
        }
        // respond 200 quickly
        return ResponseEntity.ok("ok");
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
            return false;
        }
    }
    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    private void handlePushEvent(JsonNode json) {
        String repoFullName = json.path("repository").path("full_name").asText(); // owner/repo
        String headSha = json.path("after").asText(); // new head sha
        for (JsonNode commit : json.withArray("commits")) {
            String id = commit.path("id").asText();
            for (JsonNode added : commit.withArray("added")) { /* process added.getTextValue() */ }
            for (JsonNode modified : commit.withArray("modified")) { /* process modified.getTextValue() */ }
            // commit payload contains lists of added/modified file paths already
        }
        // If you want file content, call the GitHub API with installation token to fetch the file at headSha.
    }
}

