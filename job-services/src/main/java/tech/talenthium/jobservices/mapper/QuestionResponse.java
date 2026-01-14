package tech.talenthium.jobservices.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Converter
public class QuestionResponse implements AttributeConverter<List<QuestionResponse>, String> {

    private final ObjectMapper objectMapper;

    public QuestionResponse() {
        this.objectMapper = new ObjectMapper();
        // register subtypes so Jackson knows how to deserialize properly
        objectMapper.registerSubtypes(
                new NamedType(MCQ.class, "mcq"),
                new NamedType(Descriptive.class, "descriptive"),
                new NamedType(Coding.class, "coding")
        );
    }

    @Override
    public String convertToDatabaseColumn(List<QuestionResponse> attribute) {
        if (attribute == null) return "[]";
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting QuestionResponses to JSON", e);
        }
    }

    @Override
    public List<QuestionResponse> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return new ArrayList<>();
        try {
            return objectMapper.readValue(dbData,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, QuestionResponse.class));
        } catch (IOException e) {
            throw new IllegalArgumentException("Error converting JSON to QuestionResponses", e);
        }
    }
}
