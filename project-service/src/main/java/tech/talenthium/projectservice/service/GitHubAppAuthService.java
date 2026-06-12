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
import java.util.Base64;
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
     * Generates a GitHub App JWT.
     * iat is set 60 seconds in the past to account for GitHub clock-skew requirements.
     */
    public String generateAppJWT() throws Exception {
        try {
            Path keyPath = resolveResourcePath(privateKeyPath);
            String pem = Files.readString(keyPath);

            PrivateKey pk = loadPrivateKey(pem);
            Algorithm algo = Algorithm.RSA256(null, (RSAPrivateKey) pk);

            long now = System.currentTimeMillis();
            // GitHub requires iat to be in the past (60s buffer for clock skew)
            String jwt = JWT.create()
                    .withIssuer(String.valueOf(appId))
                    .withIssuedAt(new Date(now - 60_000))
                    .withExpiresAt(new Date(now + 540_000)) // 9 min from now = 10 min from iat
                    .sign(algo);

            // Decode payload for diagnostics (payload is not secret)
            String[] parts = jwt.split("\\.");
            if (parts.length >= 2) {
                String payload = new String(Base64.getUrlDecoder().decode(
                    parts[1].length() % 4 == 0 ? parts[1] : parts[1] + "=".repeat(4 - parts[1].length() % 4)
                ));
                log.info("GitHub App JWT claims: {}", payload);
            }
            return jwt;
        } catch (Exception e) {
            log.error("Failed to generate GitHub App JWT", e);
            throw new RuntimeException("Failed to generate GitHub App JWT: " + e.getMessage(), e);
        }
    }

    /**
     * Loads an RSA private key from a PEM string.
     * Handles both PKCS8 (BEGIN PRIVATE KEY) and PKCS1 (BEGIN RSA PRIVATE KEY) formats.
     * GitHub downloads private keys in PKCS1 format.
     */
    private PrivateKey loadPrivateKey(String pem) throws Exception {
        boolean isPkcs1 = pem.contains("BEGIN RSA PRIVATE KEY");

        String base64 = pem
                .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        byte[] keyBytes = Base64.getDecoder().decode(base64);

        if (isPkcs1) {
            keyBytes = pkcs1ToPkcs8(keyBytes);
        }

        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        return KeyFactory.getInstance("RSA").generatePrivate(spec);
    }

    /**
     * Wraps PKCS1 RSA private key bytes in a PKCS8 PrivateKeyInfo envelope.
     * Equivalent to: openssl pkcs8 -topk8 -nocrypt -in key.pem -out key_pkcs8.pem
     */
    private byte[] pkcs1ToPkcs8(byte[] pkcs1) {
        // RSA AlgorithmIdentifier: SEQUENCE { OID(rsaEncryption), NULL }
        byte[] algId = {
            0x30, 0x0d,
            0x06, 0x09, 0x2a, (byte)0x86, 0x48, (byte)0x86, (byte)0xf7, 0x0d, 0x01, 0x01, 0x01,
            0x05, 0x00
        };
        byte[] version = {0x02, 0x01, 0x00};              // INTEGER 0
        byte[] octetString = derTag(0x04, pkcs1);          // OCTET STRING { pkcs1 }
        byte[] inner = concat(version, algId, octetString);
        return derTag(0x30, inner);                        // SEQUENCE { version, algId, key }
    }

    private byte[] derTag(int tag, byte[] content) {
        byte[] length = derLength(content.length);
        byte[] out = new byte[1 + length.length + content.length];
        out[0] = (byte) tag;
        System.arraycopy(length, 0, out, 1, length.length);
        System.arraycopy(content, 0, out, 1 + length.length, content.length);
        return out;
    }

    private byte[] derLength(int len) {
        if (len < 128)  return new byte[]{(byte) len};
        if (len < 256)  return new byte[]{(byte) 0x81, (byte) len};
        return new byte[]{(byte) 0x82, (byte)(len >> 8), (byte)(len & 0xff)};
    }

    private byte[] concat(byte[]... arrays) {
        int total = 0;
        for (byte[] a : arrays) total += a.length;
        byte[] result = new byte[total];
        int pos = 0;
        for (byte[] a : arrays) { System.arraycopy(a, 0, result, pos, a.length); pos += a.length; }
        return result;
    }

    private Path resolveResourcePath(String resourcePath) throws Exception {
        if (resourcePath.startsWith("classpath:")) {
            String classpath = resourcePath.replace("classpath:", "");
            ClassLoader cl = Thread.currentThread().getContextClassLoader();
            java.net.URL resource = cl.getResource(classpath);
            if (resource == null) throw new RuntimeException("Resource not found: " + classpath);
            return Paths.get(resource.toURI());
        }
        return Paths.get(resourcePath);
    }
}
