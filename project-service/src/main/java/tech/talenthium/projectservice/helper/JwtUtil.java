package tech.talenthium.projectservice.helper;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.*;
import java.security.*;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.*;
import java.util.Date;

@Slf4j
public class JwtUtil {
    @Value("${install-token-secret}") static String installationTokenSecret;
    public static String generateAppJwt(long appId, Path privateKeyPem) throws Exception {
        String pem = Files.readString(privateKeyPem);
        String base64 = pem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s","");

        byte[] keyBytes = java.util.Base64.getDecoder().decode(base64);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PrivateKey pk = kf.generatePrivate(spec);

        Algorithm algo = Algorithm.RSA256(null, (RSAPrivateKey) pk);
        long now = System.currentTimeMillis();
        return JWT.create()
                .withIssuer(String.valueOf(appId))
                .withIssuedAt(new Date(now))
                .withExpiresAt(new Date(now + 600_000)) // 10 minutes
                .sign(algo);
    }
    public static String generateInstallationToken(long userId) {
        Algorithm algo = Algorithm.HMAC256("secret1234"); // use HMAC with secret
        long now = System.currentTimeMillis();

        return JWT.create()
                .withIssuer(String.valueOf(userId))
                .withIssuedAt(new Date(now))
                .withExpiresAt(new Date(now + 60_000)) // 1 minutes
                .sign(algo);
    }
    public static DecodedJWT verifyInstallationToken(String token) {
        Algorithm algo = Algorithm.HMAC256("secret1234");

        JWTVerifier verifier = JWT.require(algo)
                .acceptLeeway(1) // optional: 1 sec clock skew
                .build();

        return verifier.verify(token); // throws if invalid
    }
}
