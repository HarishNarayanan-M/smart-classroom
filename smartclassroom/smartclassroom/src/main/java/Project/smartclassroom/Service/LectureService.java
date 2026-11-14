package Project.smartclassroom.Service;

import Project.smartclassroom.DTO.LectureRequest;
import Project.smartclassroom.DTO.LectureResponse;
import Project.smartclassroom.Entity.Course;
import Project.smartclassroom.Entity.Lecture;
import Project.smartclassroom.Repository.CourseRepository;
import Project.smartclassroom.Repository.LectureRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;

@Service
public class LectureService {

    private final LectureRepository lectureRepository;
    private final CourseRepository courseRepository;

    public LectureService(
            LectureRepository lectureRepository,
            CourseRepository courseRepository) {

        this.lectureRepository = lectureRepository;
        this.courseRepository = courseRepository;
    }

    public LectureResponse createLecture(Long courseId, LectureRequest request) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Lecture lecture = new Lecture();

        lecture.setTitle(request.getTitle());
        lecture.setDescription(request.getDescription());
        lecture.setVideoUrl(request.getVideoUrl());
        lecture.setCourse(course);

        Lecture savedLecture = lectureRepository.save(lecture);

        LectureResponse response = new LectureResponse();

        response.setId(savedLecture.getId());
        response.setTitle(savedLecture.getTitle());
        response.setDescription(savedLecture.getDescription());
        response.setVideoUrl(savedLecture.getVideoUrl());
        response.setCourseId(savedLecture.getCourse().getId());
        response.setCourseName(savedLecture.getCourse().getName());

        return response;
    }

    public List<LectureResponse> getCourseLectures(Long courseId) {

        List<Lecture> lectures =
                lectureRepository.findByCourseId(courseId);

        return lectures.stream()
                .map(lecture -> {

                    LectureResponse response = new LectureResponse();

                    response.setId(lecture.getId());
                    response.setTitle(lecture.getTitle());
                    response.setDescription(lecture.getDescription());
                    response.setVideoUrl(lecture.getVideoUrl());
                    response.setCourseId(lecture.getCourse().getId());
                    response.setCourseName(lecture.getCourse().getName());

                    return response;
                })
                .toList();
    }
    public LectureResponse uploadLecture(
            Long courseId,
            String title,
            String description,
            MultipartFile video) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        String uploadDir = "uploads/lectures/";

        try {
            Files.createDirectories(Paths.get(uploadDir));

            String fileName = video.getOriginalFilename();

            Path filePath = Paths.get(uploadDir + fileName);

            Files.write(filePath, video.getBytes());

        } catch (IOException e) {
            throw new RuntimeException("Failed to save video", e);
        }

        Lecture lecture = new Lecture();

        lecture.setTitle(title);
        lecture.setDescription(description);
        lecture.setVideoUrl("/uploads/lectures/" + video.getOriginalFilename());
        lecture.setCourse(course);

        Lecture savedLecture = lectureRepository.save(lecture);

        LectureResponse response = new LectureResponse();

        response.setId(savedLecture.getId());
        response.setTitle(savedLecture.getTitle());
        response.setDescription(savedLecture.getDescription());
        response.setVideoUrl(savedLecture.getVideoUrl());
        response.setCourseId(savedLecture.getCourse().getId());
        response.setCourseName(savedLecture.getCourse().getName());

        return response;
    }

    public void deleteLecture(Long courseId, Long lectureId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));

        if (!lecture.getCourse().getId().equals(courseId)) {
            throw new RuntimeException(
                    "Lecture does not belong to this course"
            );
        }

        lectureRepository.delete(lecture);
    }
}