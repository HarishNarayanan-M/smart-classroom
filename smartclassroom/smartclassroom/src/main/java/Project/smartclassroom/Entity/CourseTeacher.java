package Project.smartclassroom.Entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "course_teachers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_course_teacher",
                        columnNames = {"course_id", "teacher_id"}
                )
        }
)
public class CourseTeacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    public CourseTeacher() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }
}