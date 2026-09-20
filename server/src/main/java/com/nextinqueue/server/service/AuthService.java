package com.nextinqueue.server.service;

import com.nextinqueue.server.controller.dto.AuthResponse;
import com.nextinqueue.server.controller.dto.LoginRequest;
import com.nextinqueue.server.controller.dto.RegisterRequest;
import com.nextinqueue.server.model.EmailVerification;
import com.nextinqueue.server.model.User;
import com.nextinqueue.server.repository.EmailVerificationRepository;
import com.nextinqueue.server.repository.HistoryRepository;
import com.nextinqueue.server.repository.LibraryItemRepository;
import com.nextinqueue.server.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final String REGISTRATION = "REGISTRATION";
    private static final String PASSWORD_RESET = "PASSWORD_RESET";
    private static final String DELETE_ACCOUNT = "DELETE_ACCOUNT";

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final HistoryRepository historyRepository;
    private final LibraryItemRepository libraryItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            EmailVerificationRepository emailVerificationRepository,
            HistoryRepository historyRepository,
            LibraryItemRepository libraryItemRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.emailVerificationRepository = emailVerificationRepository;
        this.historyRepository = historyRepository;
        this.libraryItemRepository = libraryItemRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /*
     * Registration
     *
     * The account is created only after the email OTP
     * has been successfully verified.
     */
    public void startRegistration(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();
        String name = request.getName().trim();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists.");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        if (request.getPassword().length() < 8) {
            throw new IllegalArgumentException(
                    "Password must be at least 8 characters.");
        }

        String otp = generateOtp();

        emailVerificationRepository.deleteByEmailAndPurpose(
                email,
                REGISTRATION);

        EmailVerification verification =
                new EmailVerification(
                        email,
                        otp,
                        REGISTRATION,
                        LocalDateTime.now().plusMinutes(10));

        verification.setName(name);
        verification.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));

        emailVerificationRepository.save(verification);

        emailService.sendOtpEmail(
                email,
                otp,
                REGISTRATION);
    }

    /*
     * Password reset
     */
    public void startPasswordReset(String email) {

        email = email.trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No account was found with this email address."));

        String otp = generateOtp();

        emailVerificationRepository.deleteByEmailAndPurpose(
                email,
                PASSWORD_RESET);

        EmailVerification verification =
                new EmailVerification(
                        email,
                        otp,
                        PASSWORD_RESET,
                        LocalDateTime.now().plusMinutes(10));

        emailVerificationRepository.save(verification);

        emailService.sendOtpEmail(
                email,
                otp,
                PASSWORD_RESET);
    }

    /*
     * Verify registration or password-reset OTP.
     */
    public void verifyOtp(
            String email,
            String otp,
            String purpose) {

        email = email.trim().toLowerCase();

        EmailVerification verification =
                emailVerificationRepository
                        .findTopByEmailAndPurposeOrderByIdDesc(
                                email,
                                purpose)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "No valid OTP request was found."));

        if (verification.isVerified()) {
            throw new IllegalArgumentException(
                    "This OTP has already been used.");
        }

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "This OTP has expired. Please request a new one.");
        }

        if (!verification.getOtp().equals(otp)) {
            throw new IllegalArgumentException(
                    "Invalid OTP. Please check the code and try again.");
        }

        verification.setVerified(true);
        emailVerificationRepository.save(verification);

        /*
         * For registration, create the account immediately after
         * successful email verification.
         */
        if (REGISTRATION.equals(purpose)) {

            if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException(
                        "An account with this email already exists.");
            }

            User user = new User(
                    verification.getName(),
                    email,
                    verification.getPasswordHash());

            userRepository.save(user);
        }
    }

    /*
     * Reset password after successful OTP verification.
     */
    public void resetPassword(
            String email,
            String otp,
            String newPassword,
            String confirmPassword) {

        email = email.trim().toLowerCase();

        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must be at least 8 characters.");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException(
                    "Passwords do not match.");
        }

        EmailVerification verification =
                emailVerificationRepository
                        .findTopByEmailAndPurposeOrderByIdDesc(
                                email,
                                PASSWORD_RESET)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "No valid password reset request was found."));

        if (!verification.isVerified()) {
            throw new IllegalArgumentException(
                    "Please verify the OTP before resetting your password.");
        }

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "The OTP has expired. Please request a new one.");
        }

        if (!verification.getOtp().equals(otp)) {
            throw new IllegalArgumentException(
                    "Invalid OTP.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No account was found with this email address."));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        emailVerificationRepository.deleteByEmailAndPurpose(
                email,
                PASSWORD_RESET);
    }

    /*
     * Request account deletion OTP.
     *
     * This method requires the currently authenticated user.
     * The supplied email must belong to that exact authenticated account.
     */
    public void startAccountDeletion(
            User authenticatedUser,
            String enteredEmail) {

        if (authenticatedUser == null) {
            throw new IllegalArgumentException(
                    "Authentication is required.");
        }

        if (enteredEmail == null || enteredEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required.");
        }

        String email = enteredEmail.trim().toLowerCase();

        if (!email.equals(
                authenticatedUser.getEmail().trim().toLowerCase())) {

            throw new IllegalArgumentException(
                    "The email does not match your authenticated account.");
        }

        User currentUser = userRepository.findById(
                authenticatedUser.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Your account could not be found."));

        if (!email.equals(
                currentUser.getEmail().trim().toLowerCase())) {

            throw new IllegalArgumentException(
                    "The email does not match your authenticated account.");
        }

        String otp = generateOtp();

        emailVerificationRepository.deleteByEmailAndPurpose(
                email,
                DELETE_ACCOUNT);

        EmailVerification verification =
                new EmailVerification(
                        email,
                        otp,
                        DELETE_ACCOUNT,
                        LocalDateTime.now().plusMinutes(10));

        emailVerificationRepository.save(verification);

        emailService.sendOtpEmail(
                email,
                otp,
                DELETE_ACCOUNT);
    }

    /*
     * Permanently delete the authenticated account after OTP verification.
     */
    @Transactional
    public void deleteAccount(
            User authenticatedUser,
            String enteredEmail,
            String otp) {

        if (authenticatedUser == null) {
            throw new IllegalArgumentException(
                    "Authentication is required.");
        }

        if (enteredEmail == null || enteredEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required.");
        }

        if (otp == null || otp.isBlank()) {
            throw new IllegalArgumentException(
                    "OTP is required.");
        }

        String email = enteredEmail.trim().toLowerCase();

        if (!email.equals(
                authenticatedUser.getEmail().trim().toLowerCase())) {

            throw new IllegalArgumentException(
                    "The email does not match your authenticated account.");
        }

        User currentUser = userRepository.findById(
                authenticatedUser.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Your account could not be found."));

        if (!email.equals(
                currentUser.getEmail().trim().toLowerCase())) {

            throw new IllegalArgumentException(
                    "The email does not match your authenticated account.");
        }

        EmailVerification verification =
                emailVerificationRepository
                        .findTopByEmailAndPurposeOrderByIdDesc(
                                email,
                                DELETE_ACCOUNT)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "No valid account deletion OTP was found."));

        if (verification.isVerified()) {
            throw new IllegalArgumentException(
                    "This OTP has already been used.");
        }

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException(
                    "This OTP has expired. Please request a new one.");
        }

        if (!verification.getOtp().equals(otp.trim())) {
            throw new IllegalArgumentException(
                    "Invalid OTP. Please check the code and try again.");
        }

        Long userId = currentUser.getId();

        /*
         * Delete every piece of user-owned data before deleting
         * the user account itself.
         */
        libraryItemRepository.deleteByUserId(userId);
        historyRepository.deleteByUserId(userId);

        /*
         * Remove every verification/reset/deletion record
         * associated with this email.
         */
        emailVerificationRepository.deleteByEmail(email);

        /*
         * Finally delete the actual account.
         */
        userRepository.delete(currentUser);
    }

    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists.");
        }

        throw new IllegalArgumentException(
                "Email verification is required before creating the account.");
    }

    public User authenticate(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password."));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password.");
        }

        return user;
    }

    private String generateOtp() {
        return String.format(
                "%06d",
                secureRandom.nextInt(1_000_000));
    }
}
