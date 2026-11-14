package Project.smartclassroom.Controller;

import Project.smartclassroom.DTO.AttendanceRequest;
import Project.smartclassroom.DTO.AttendanceResponse;
import Project.smartclassroom.DTO.AttendanceSummaryResponse;
import Project.smartclassroom.Service.AttendanceService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/courses/{courseId}/attendance")
    public AttendanceResponse markAttendance(
            @PathVariable Long courseId,
            @RequestBody AttendanceRequest request) {

        return attendanceService.markAttendance(courseId, request);
    }

    @GetMapping("/courses/{courseId}/attendance")
    public List<AttendanceResponse> getAttendanceByCourseAndDate(
            @PathVariable Long courseId,
            @RequestParam LocalDate date) {

        return attendanceService.getAttendanceByCourseAndDate(
                courseId, date);
    }

    @GetMapping("/students/{studentId}/attendance")
    public List<AttendanceResponse> getAttendanceByStudent(
            @PathVariable Long studentId) {

        return attendanceService.getAttendanceByStudent(studentId);
    }

    @GetMapping("/students/{studentId}/courses/{courseId}/attendance/percentage")
    public double getAttendancePercentage(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {

        return attendanceService.calculateAttendancePercentage(
                studentId, courseId);
    }

    @GetMapping("/students/{studentId}/courses/{courseId}/attendance/summary")
    public AttendanceSummaryResponse getAttendanceSummary(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {

        return attendanceService.getAttendanceSummary(studentId, courseId);
    }
}
