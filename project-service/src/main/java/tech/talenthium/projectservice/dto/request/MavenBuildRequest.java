package tech.talenthium.projectservice.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class MavenBuildRequest {
    private Map<String, String> files;
}
