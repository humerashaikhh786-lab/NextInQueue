package com.nextinqueue.server.controller.dto;

import com.nextinqueue.server.model.User;
import com.nextinqueue.server.repository.UserRepository;
import com.nextinqueue.server.security.JwtService;
import com.nextinqueue.server.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            UserRepository userRepository) {

        this.authService = authService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    // =========================
    // REGISTER / SEND OTP
    // =========================

    @PostMapping("/register")
    public ResponseEntity<ApiMessage> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.startRegistration(request);

        return ResponseEntity.ok(
                new ApiMessage(
                        "Verification OTP sent to your email address."));
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        User user = authService.authenticate(request);

        String token = jwtService.generateToken(user);

        AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name());

        return ResponseEntity.ok(response);
    }

    // =========================
    // FORGOT PASSWORD
    // =========================

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiMessage> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.startPasswordReset(request.email());

        return ResponseEntity.ok(
                new ApiMessage(
                        "Password reset OTP sent to your email address."));
    }

    // =========================
    // VERIFY OTP
    // =========================

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiMessage> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        authService.verifyOtp(
                request.email(),
                request.otp(),
                request.purpose());

        return ResponseEntity.ok(
                new ApiMessage("OTP verified successfully."));
    }

    // =========================
    // RESET PASSWORD
    // =========================

    @PostMapping("/reset-password")
    public ResponseEntity<ApiMessage> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(
                request.email(),
                request.otp(),
                request.password(),
                request.confirmPassword());

        return ResponseEntity.ok(
                new ApiMessage("Password reset successfully."));
    }

    // =========================
    // DELETE ACCOUNT / SEND OTP
    // =========================

    @PostMapping("/delete-account/request")
    public ResponseEntity<ApiMessage> requestAccountDeletion(
            @Valid @RequestBody DeleteAccountRequest request,
            org.springframework.security.core.Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found."));

        authService.startAccountDeletion(
                user,
                request.email());

        return ResponseEntity.ok(
                new ApiMessage(
                        "Account deletion OTP sent to your email address."));
    }

    // =========================
    // DELETE ACCOUNT / CONFIRM
    // =========================

    @PostMapping("/delete-account/confirm")
    public ResponseEntity<ApiMessage> confirmAccountDeletion(
            @Valid @RequestBody ConfirmDeleteAccountRequest request,
            org.springframework.security.core.Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found."));

        authService.deleteAccount(
                user,
                request.email(),
                request.otp());

        return ResponseEntity.ok(
                new ApiMessage(
                        "Your account has been successfully deleted."));
    }

    // =========================
    // CURRENT USER
    // =========================

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(
            org.springframework.security.core.Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found."));

        UserProfileResponse response = new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getTheme(),
                user.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    // =========================
    // DTOs
    // =========================

    public record ApiMessage(String message) {
    }

    public record ForgotPasswordRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email) {
    }

    public record VerifyOtpRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email,

            @NotBlank(message = "OTP is required")
            @Size(min = 6, max = 6, message = "OTP must contain 6 digits")
            String otp,

            @NotBlank(message = "Purpose is required")
            String purpose) {
    }

    public record ResetPasswordRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email,

            @NotBlank(message = "OTP is required")
            @Size(min = 6, max = 6, message = "OTP must contain 6 digits")
            String otp,

            @NotBlank(message = "Password is required")
            @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
            String password,

            @NotBlank(message = "Confirm password is required")
            String confirmPassword) {
    }

    public record DeleteAccountRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email) {
    }

    public record ConfirmDeleteAccountRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String email,

            @NotBlank(message = "OTP is required")
            @Size(min = 6, max = 6, message = "OTP must contain 6 digits")
            String otp) {
    }

    public record UserProfileResponse(
            Long id,
            String name,
            String email,
            String role,
            String theme,
            java.time.LocalDateTime createdAt) {
    }
}


