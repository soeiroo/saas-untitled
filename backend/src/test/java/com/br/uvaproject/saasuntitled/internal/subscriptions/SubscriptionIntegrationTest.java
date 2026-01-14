package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SubscriptionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @BeforeEach
    void setUp() {
        subscriptionRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User();
        user.setEmail("test@example.com");
        user.setName("Test User");
        user.setPasswordHash(passwordEncoder.encode("123456"));
        userRepository.save(user);
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void createSubscription_ShouldReturnCreated() throws Exception {

        SubscriptionCreateDTO createDTO = new SubscriptionCreateDTO(
                "Netflix",
                BigDecimal.valueOf(29.90),
                LocalDate.now().plusDays(30),
                "Streaming",
                LocalDate.now(),
                "Premium",
                "Monthly"
        );

        mockMvc.perform(post("/api/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Netflix"))
                .andExpect(jsonPath("$.price").value(29.90))
                .andExpect(jsonPath("$.category").value("Streaming"))
                .andExpect(jsonPath("$.plan").value("Premium"))
                .andExpect(jsonPath("$.period").value("Monthly"));
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void deleteSubscription_ShouldReturnNoContent() throws Exception {

        SubscriptionCreateDTO createDTO = new SubscriptionCreateDTO(
                "Disney+",
                BigDecimal.valueOf(27.90),
                LocalDate.now().plusDays(30),
                "Streaming",
                LocalDate.now(),
                "Premium",
                "Monthly"
        );

        String response = mockMvc.perform(post("/api/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(delete("/api/subscriptions/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/subscriptions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }
}
