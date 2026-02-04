package com.br.uvaproject.saasuntitled.internal.auth;

import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.UserService;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserCreateDTO;
import com.br.uvaproject.saasuntitled.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.net.URI;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

        private final UserService userService;
        private final JwtUtil jwtUtil;

        @PostMapping("/register")
        public ResponseEntity<TokenResponse> register(
                        @RequestBody @Valid RegisterRequest request) {
                User user = userService.create(
                                new UserCreateDTO(
                                                request.email(),
                                                request.password(),
                                                request.name(),
                                                request.profilePicture(),
                                                "free"));

                String token = jwtUtil.generateToken(user.getEmail());

                URI location = URI.create("/api/users/me");

                return ResponseEntity
                                .created(location)
                                .body(new TokenResponse(token));
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody LoginRequest request) {

                User user = userService.authenticate(
                                request.email(),
                                request.password());

                String token = jwtUtil.generateToken(user.getEmail());

                return ResponseEntity.ok(new TokenResponse(token));
        }

        public record RegisterRequest(String email, String password, String name, String profilePicture,
                        String userPlan) {
        }

        public record LoginRequest(String email, String password) {
        }

        public record TokenResponse(String token) {
        }
}
