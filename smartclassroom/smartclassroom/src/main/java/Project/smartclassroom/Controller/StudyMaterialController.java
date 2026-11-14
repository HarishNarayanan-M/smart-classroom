package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.StudyMaterialRequest;
import Project.smartclassroom.DTO.StudyMaterialResponse;
import Project.smartclassroom.Service.StudyMaterialService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class StudyMaterialController {

    private final StudyMaterialService studyMaterialService;

    public StudyMaterialController(StudyMaterialService studyMaterialService) {
        this.studyMaterialService = studyMaterialService;
    }

    @PostMapping("/{courseId}/materials")
    public StudyMaterialResponse createStudyMaterial(
            @PathVariable Long courseId,
            @RequestBody StudyMaterialRequest request) {

        return studyMaterialService.createStudyMaterial(courseId, request);
    }
    @GetMapping("/{courseId}/materials")
    public List<StudyMaterialResponse> getStudyMaterials(
            @PathVariable Long courseId) {

        return studyMaterialService.getStudyMaterialsByCourse(courseId);
    }

    @PostMapping("/{courseId}/materials/upload")
    public StudyMaterialResponse uploadStudyMaterial(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("file") MultipartFile file) {

        return studyMaterialService.uploadStudyMaterial(
                courseId,
                title,
                description,
                file
        );
    }


    @DeleteMapping("/{courseId}/materials/{materialId}")
    public void deleteStudyMaterial(
            @PathVariable Long courseId,
            @PathVariable Long materialId) {

        studyMaterialService.deleteStudyMaterial(courseId, materialId);
    }

}