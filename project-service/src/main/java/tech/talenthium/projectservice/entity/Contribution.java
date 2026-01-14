package tech.talenthium.projectservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Entity
@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Contribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @NotNull
    private Project project;

    @ManyToOne
    @NotNull
    private Contributor contributor;

    @NotNull
    private String type;
    @NotNull
    private String commit;
    @NotNull
    private String commitSummary;
    @NotNull
    @Column(columnDefinition = "TEXT")
    private String detailedDes;

    @ElementCollection
    private List<String> techStack;

}
