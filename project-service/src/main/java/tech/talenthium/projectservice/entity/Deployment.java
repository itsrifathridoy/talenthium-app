package tech.talenthium.projectservice.entity;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import tech.talenthium.projectservice.type.DeploymentStatus;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Deployment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @NotNull
    @JsonBackReference(value = "project-deployments")
    private Project project;

    @NotNull
    private DeploymentStatus status;
    @Column(columnDefinition = "TEXT")
    private String log;

    private LocalDateTime startedAt=LocalDateTime.now();

    private LocalDateTime completedAt;

}
