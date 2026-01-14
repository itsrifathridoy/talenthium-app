package tech.talenthium.projectservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class GitHubService {
    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public String createInstallationToken(long installationId, String appJwt) throws Exception {
        String url = "https://api.github.com/app/installations/" + installationId + "/access_tokens";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(appJwt);
        headers.set("Accept", "application/vnd.github+json");
        HttpEntity<String> entity = new HttpEntity<>("{}", headers);
        ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.POST, entity, JsonNode.class);
        if (resp.getStatusCode().is2xxSuccessful()) {
            return resp.getBody().get("token").asText();
        }
        throw new RuntimeException("Unable to create installation token: " + resp.getStatusCode());
    }

    public JsonNode listInstallationRepos(String installationToken) {
        String url = "https://api.github.com/installation/repositories";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(installationToken);
        headers.set("Accept", "application/vnd.github+json");
        ResponseEntity<JsonNode> resp = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), JsonNode.class);
        return resp.getBody();
    }
}

