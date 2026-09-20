package com.nextinqueue.server.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String email, String otp, String purpose) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setFrom("humerashaikhh786@gmail.com");

        if ("REGISTRATION".equals(purpose)) {
            message.setSubject("NextInQueue - Verify Your Email");
            message.setText(
                    "Hello,\n\n"
                            + "Your NextInQueue verification code is:\n\n"
                            + otp
                            + "\n\n"
                            + "This OTP is valid for 10 minutes.\n\n"
                            + "If you did not request this code, you can safely ignore this email.\n\n"
                            + "Regards,\n"
                            + "NextInQueue");
        } else if ("PASSWORD_RESET".equals(purpose)) {
            message.setSubject("NextInQueue - Password Reset OTP");
            message.setText(
                    "Hello,\n\n"
                            + "Your NextInQueue password reset verification code is:\n\n"
                            + otp
                            + "\n\n"
                            + "This OTP is valid for 10 minutes.\n\n"
                            + "If you did not request a password reset, you can safely ignore this email.\n\n"
                            + "Regards,\n"
                            + "NextInQueue");
        } else if ("DELETE_ACCOUNT".equals(purpose)) {
            message.setSubject("NextInQueue - Account Deletion Verification OTP");
            message.setText(
                    "Hello,\n\n"
                            + "Your NextInQueue account deletion verification code is:\n\n"
                            + otp
                            + "\n\n"
                            + "This OTP is valid for 10 minutes.\n\n"
                            + "If you did not request account deletion, please ignore this email and secure your account.\n\n"
                            + "Regards,\n"
                            + "NextInQueue");
        } else {
            message.setSubject("NextInQueue - Verification OTP");
            message.setText(
                    "Hello,\n\n"
                            + "Your NextInQueue verification code is:\n\n"
                            + otp
                            + "\n\n"
                            + "This OTP is valid for 10 minutes.\n\n"
                            + "Regards,\n"
                            + "NextInQueue");
        }

        mailSender.send(message);
    }
}
