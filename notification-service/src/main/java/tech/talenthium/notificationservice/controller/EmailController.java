package tech.talenthium.notificationservice.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.thymeleaf.context.Context;
import tech.talenthium.notificationservice.model.VerificationMail;
import tech.talenthium.notificationservice.service.EmailService;

@RestController
@AllArgsConstructor
public class EmailController {

    EmailService emailService;
    // Example endpoint
    @PostMapping("/sendMailWithHtml")
    public String sendMailWithHtml(@RequestBody VerificationMail emailDetails) {
        System.out.println("Received email details: " + emailDetails);
        System.out.println(emailDetails.getRole().name());
        Context context = new Context();
        context.setVariable("name", emailDetails.getName());
        context.setVariable("role", emailDetails.getRole().name());
        context.setVariable("verificationLink", emailDetails.getVerificationLink());
        try {
            emailService.sendVerificationMail(emailDetails.getTo(),
                    emailDetails.getSubject(),
                    "verification-mail",
                    context);
            return "Email sent successfully with HTML template.";
        } catch (Exception e) {
            return "Error sending email: " + e.getMessage();
        }
    }
}
