package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.LectureRequest;
import Project.smartclassroom.DTO.LectureResponse;
import Project.smartclassroom.Service.LectureService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class LectureController {

    private final LectureService lectureService;

    public LectureController(LectureService lectureService) {
        this.lectureService = lectureService;
    }

    @PostMapping("/{courseId}/lectures")
    public LectureResponse createLecture(
            @PathVariable Long courseId,
            @RequestBody LectureRequest request) {

        return lectureService.createLecture(courseId, request);
    }
    @GetMapping("/{courseId}/lectures")
    public List<LectureResponse> getCourseLectures(
            @PathVariable Long courseId) {

        return lectureService.getCourseLectures(courseId);
    }
    @PostMapping("/{courseId}/lectures/upload")
    public LectureResponse uploadLecture(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("video") MultipartFile video) {

        return lectureService.uploadLecture(
                courseId,
                title,
                description,
                video
        );
    }

    @DeleteMapping("/{courseId}/lectures/{lectureId}")
    public void deleteLecture(
            @PathVariable Long courseId,
            @PathVariable Long lectureId) {

        lectureService.deleteLecture(courseId, lectureId);
    }
}