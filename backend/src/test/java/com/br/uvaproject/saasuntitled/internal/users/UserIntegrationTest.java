package com.br.uvaproject.saasuntitled.internal.users;

import com.br.uvaproject.saasuntitled.internal.users.dto.UserUpdateDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user = new User();
        user.setEmail("test@example.com");
        user.setName("Test User");
        user.setPasswordHash(passwordEncoder.encode("123456"));

        userRepository.save(user);
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void getMe_ShouldReturnUser() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.name").value("Test User"));
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void updateMe_ShouldUpdateUserAndReturnNoContent() throws Exception {

        UserUpdateDTO dto =
                new UserUpdateDTO("new@example.com", "New Name", "newpass");

        mockMvc.perform(put("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNoContent());

        User updated =
                userRepository.findByEmail("new@example.com").orElseThrow();

        assertEquals("New Name", updated.getName());
        assertTrue(passwordEncoder.matches("newpass", updated.getPasswordHash()));
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void deleteMe_ShouldDeleteUserAndReturnNoContent() throws Exception {

        mockMvc.perform(delete("/api/users/me"))
                .andExpect(status().isNoContent());

        assertTrue(userRepository.findByEmail("test@example.com").isEmpty());
    }
}
