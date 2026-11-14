package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.StudyMaterialRequest;
import Project.smartclassroom.DTO.StudyMaterialResponse;
import Project.smartclassroom.Entity.Course;
import Project.smartclassroom.Entity.StudyMaterial;
import Project.smartclassroom.Repository.CourseRepository;
import Project.smartclassroom.Repository.StudyMaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class StudyMaterialService {

    private final StudyMaterialRepository studyMaterialRepository;
    private final CourseRepository courseRepository;

    public StudyMaterialService(StudyMaterialRepository studyMaterialRepository,
                                CourseRepository courseRepository) {
        this.studyMaterialRepository = studyMaterialRepository;
        this.courseRepository = courseRepository;
    }

    public StudyMaterialResponse createStudyMaterial(
            Long courseId,
            StudyMaterialRequest request) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        StudyMaterial material = new StudyMaterial();

        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setFileUrl(request.getFileUrl());
        material.setFileType(request.getFileType());
        material.setCourse(course);

        StudyMaterial savedMaterial =
                studyMaterialRepository.save(material);

        StudyMaterialResponse response = new StudyMaterialResponse();

        response.setId(savedMaterial.getId());
        response.setTitle(savedMaterial.getTitle());
        response.setDescription(savedMaterial.getDescription());
        response.setFileUrl(savedMaterial.getFileUrl());
        response.setFileType(savedMaterial.getFileType());
        response.setCourseId(course.getId());
        response.setCourseName(course.getName());

        return response;
    }

    public List<StudyMaterialResponse> getStudyMaterialsByCourse(Long courseId) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<StudyMaterial> materials =
                studyMaterialRepository.findByCourseId(courseId);

        return materials.stream()
                .map(material -> {

                    StudyMaterialResponse response = new StudyMaterialResponse();

                    response.setId(material.getId());
                    response.setTitle(material.getTitle());
                    response.setDescription(material.getDescription());
                    response.setFileUrl(material.getFileUrl());
                    response.setFileType(material.getFileType());
                    response.setCourseId(course.getId());
                    response.setCourseName(course.getName());

                    return response;
                })
                .toList();
    }

    public StudyMaterialResponse uploadStudyMaterial(
            Long courseId,
            String title,
            String description,
            MultipartFile file) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        String uploadDir = "uploads/materials/";

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null || originalName.isBlank()) {
            throw new RuntimeException("Invalid file name");
        }

        String safeOriginalName = Paths.get(originalName)
                .getFileName()
                .toString();

        String extension = "";

        int dotIndex = safeOriginalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = safeOriginalName.substring(dotIndex)
                    .toLowerCase(Locale.ROOT);
        }

        if (!List.of(".pdf", ".ppt", ".pptx").contains(extension)) {
            throw new RuntimeException("Only PDF, PPT, and PPTX files are allowed");
        }

        String storedFileName = UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            Path filePath = uploadPath.resolve(storedFileName).normalize();

            if (!filePath.startsWith(uploadPath)) {
                throw new RuntimeException("Invalid file path");
            }

            Files.copy(file.getInputStream(), filePath);

        } catch (IOException e) {
            throw new RuntimeException("Failed to save study material", e);
        }

        StudyMaterial material = new StudyMaterial();

        material.setTitle(title);
        material.setDescription(description);
        material.setFileUrl("/uploads/materials/" + storedFileName);
        material.setFileType(file.getContentType());
        material.setCourse(course);

        StudyMaterial savedMaterial =
                studyMaterialRepository.save(material);

        StudyMaterialResponse response = new StudyMaterialResponse();

        response.setId(savedMaterial.getId());
        response.setTitle(savedMaterial.getTitle());
        response.setDescription(savedMaterial.getDescription());
        response.setFileUrl(savedMaterial.getFileUrl());
        response.setFileType(savedMaterial.getFileType());
        response.setCourseId(savedMaterial.getCourse().getId());
        response.setCourseName(savedMaterial.getCourse().getName());

        return response;
    }


    public void deleteStudyMaterial(Long courseId, Long materialId) {
        StudyMaterial material = studyMaterialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Study material not found"));

        if (!material.getCourse().getId().equals(courseId)) {
            throw new RuntimeException(
                    "Study material does not belong to this course"
            );
        }

        studyMaterialRepository.delete(material);
    }

}