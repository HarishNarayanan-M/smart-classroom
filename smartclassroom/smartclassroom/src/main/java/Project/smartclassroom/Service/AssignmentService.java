package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.AssignmentRequest;
import Project.smartclassroom.DTO.AssignmentResponse;
import Project.smartclassroom.Entity.Assignment;
import Project.smartclassroom.Entity.Course;
import Project.smartclassroom.Repository.AssignmentRepository;
import Project.smartclassroom.Repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             CourseRepository courseRepository) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
    }

    public AssignmentResponse createAssignment(
            Long courseId,
            AssignmentRequest request) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Assignment assignment = new Assignment();

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDueDate(request.getDueDate());
        assignment.setCourse(course);

        Assignment savedAssignment =
                assignmentRepository.save(assignment);

        return convertToResponse(savedAssignment);
    }

    public List<AssignmentResponse> getAssignmentsByCourse(Long courseId) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return assignmentRepository.findByCourseId(courseId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private AssignmentResponse convertToResponse(Assignment assignment) {

        AssignmentResponse response = new AssignmentResponse();

        response.setId(assignment.getId());
        response.setTitle(assignment.getTitle());
        response.setDescription(assignment.getDescription());
        response.setDueDate(assignment.getDueDate());
        response.setCourseId(assignment.getCourse().getId());
        response.setCourseName(assignment.getCourse().getName());

        return response;
    }


    public void deleteAssignment(Long courseId, Long assignmentId) {

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (!assignment.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Assignment does not belong to this course");
        }

        assignmentRepository.delete(assignment);
    }

}