package tech.talenthium.projectservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import tech.talenthium.projectservice.type.ProjectRole;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Contributor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long contributorId;

    @ManyToOne
    @NotNull
    private Project project;

    @NotNull
    private ProjectRole role;
    private LocalDateTime joinAt = LocalDateTime.now();

}
