package tech.talenthium.projectservice.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;

@Converter
public class JsonNodeConverter implements AttributeConverter<JsonNode, String> {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(JsonNode attribute) {
        try {
            if (attribute == null || !attribute.isArray()) return null;

            ArrayNode outputArray = mapper.createArrayNode();

            for (JsonNode repo : attribute) {
                ObjectNode node = mapper.createObjectNode();
                node.put("id", repo.path("id").asLong());
                node.put("full_name", repo.path("full_name").asText());
                node.put("private", repo.path("private").asBoolean());
                node.put("fork", repo.path("fork").asBoolean());
                node.put("default_branch", repo.path("default_branch").asText());

                // Owner
                JsonNode owner = repo.path("owner");
                ObjectNode ownerNode = mapper.createObjectNode();
                ownerNode.put("login", owner.path("login").asText());
                ownerNode.put("id", owner.path("id").asLong());
                ownerNode.put("avatar_url", owner.path("avatar_url").asText());
                ownerNode.put("type", owner.path("type").asText());

                node.set("owner", ownerNode);

                outputArray.add(node);
            }

            return mapper.writeValueAsString(outputArray);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public JsonNode convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null) return null;
            return mapper.readTree(dbData);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
