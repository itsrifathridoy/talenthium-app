package tech.talenthium.projectservice.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Date;

@Service
@Slf4j
@RequiredArgsConstructor
public class GitHubAppAuthService {

    @Value("${github.app-id}")
    private long appId;

    @Value("${github.private-key-pem}")
    private String privateKeyPath;

    /**
     * Generates a JWT token for authenticating as the GitHub App.
     * The JWT is valid for 10 minutes.
     * 
     * @return JWT token signed with the GitHub App's private key
     */
    public String generateAppJWT() throws Exception {
        try {
            Path keyPath = resolveResourcePath(privateKeyPath);
            String pem = Files.readString(keyPath);
            
            // Extract base64 content from PEM format
            String base64 = pem
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");

            // Decode base64 to get the key bytes
            byte[] keyBytes = java.util.Base64.getDecoder().decode(base64);
            
            // Create the private key object
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            PrivateKey pk = kf.generatePrivate(spec);

            // Create JWT with RSA256 algorithm
            Algorithm algo = Algorithm.RSA256(null, (RSAPrivateKey) pk);
            long now = System.currentTimeMillis();
            
            String jwt = JWT.create()
                    .withIssuer(String.valueOf(appId))
                    .withIssuedAt(new Date(now))
                    .withExpiresAt(new Date(now + 600_000)) // 10 minutes
                    .sign(algo);

            log.debug("Generated JWT for GitHub App with ID: {}", appId);
            return jwt;
        } catch (Exception e) {
            log.error("Error generating JWT for GitHub App", e);
            throw new RuntimeException("Failed to generate GitHub App JWT: " + e.getMessage(), e);
        }
    }

    /**
     * Resolves classpath resources to actual file paths.
     * Handles both 'classpath:' prefixed paths and regular file paths.
     * Properly handles Windows paths with drive letters.
     * 
     * @param resourcePath - The resource path (e.g., classpath:secrets/key.pem or /path/to/key.pem)
     * @return The resolved Path object
     */
    private Path resolveResourcePath(String resourcePath) throws Exception {
        if (resourcePath.startsWith("classpath:")) {
            String classpath = resourcePath.replace("classpath:", "");
            ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
            java.net.URL resource = classLoader.getResource(classpath);
            if (resource == null) {
                throw new RuntimeException("Resource not found: " + classpath);
            }
            // Use toURI() to properly handle Windows paths with drive letters
            return Paths.get(resource.toURI());
        } else {
            return Paths.get(resourcePath);
        }
    }
}
