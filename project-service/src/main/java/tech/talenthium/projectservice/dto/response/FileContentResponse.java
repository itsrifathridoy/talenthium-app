package tech.talenthium.projectservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileContentResponse {
    private String fileName;
    private String path;
    private String content;
    private String sha;
    private String htmlUrl;
}
