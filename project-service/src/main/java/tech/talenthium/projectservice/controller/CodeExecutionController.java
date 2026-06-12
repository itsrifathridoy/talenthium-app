package tech.talenthium.projectservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.talenthium.projectservice.dto.request.MavenBuildRequest;

import java.io.IOException;
import java.nio.file.*;
import java.util.Comparator;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/projects/execute")
public class CodeExecutionController {

    @PostMapping("/maven")
    public ResponseEntity<Map<String, Object>> buildMaven(@RequestBody MavenBuildRequest request) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("talenthium-build-");
            writeFiles(request.getFiles(), tempDir);

            String mvnCmd = Files.exists(tempDir.resolve("mvnw")) ? "./mvnw" : "mvn";
            ProcessBuilder pb = new ProcessBuilder(mvnCmd, "compile", "-q", "--no-transfer-progress");
            pb.directory(tempDir.toFile());
            pb.redirectErrorStream(true);
            pb.environment().put("MAVEN_OPTS", "-Xmx512m");

            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes());
            boolean finished = process.waitFor(120, java.util.concurrent.TimeUnit.SECONDS);
            int exitCode = finished ? process.exitValue() : -1;
            if (!finished) process.destroyForcibly();

            return ResponseEntity.ok(Map.of(
                "output", output,
                "exitCode", exitCode,
                "success", exitCode == 0
            ));
        } catch (Exception e) {
            log.error("Maven build failed", e);
            return ResponseEntity.ok(Map.of(
                "output", e.getMessage() != null ? e.getMessage() : "Build error",
                "exitCode", -1,
                "success", false
            ));
        } finally {
            if (tempDir != null) deleteDir(tempDir);
        }
    }

    private void writeFiles(Map<String, String> files, Path root) throws IOException {
        if (files == null) return;
        for (Map.Entry<String, String> entry : files.entrySet()) {
            Path target = root.resolve(entry.getKey()).normalize();
            if (!target.startsWith(root)) continue; // path traversal guard
            Files.createDirectories(target.getParent());
            Files.writeString(target, entry.getValue());
        }
    }

    private void deleteDir(Path dir) {
        try {
            Files.walk(dir)
                .sorted(Comparator.reverseOrder())
                .forEach(p -> { try { Files.delete(p); } catch (IOException ignored) {} });
        } catch (IOException ignored) {}
    }
}
