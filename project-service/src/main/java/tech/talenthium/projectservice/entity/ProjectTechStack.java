package tech.talenthium.projectservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProjectTechStack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)  // avoid duplicate tech entries
    private String technology;

    @ManyToMany(mappedBy = "techStack")
    private List<Project> projects = new ArrayList<>();
}
