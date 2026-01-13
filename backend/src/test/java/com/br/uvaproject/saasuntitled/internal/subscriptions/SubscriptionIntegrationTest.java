package com.br.uvaproject.saasuntitled.internal.subscriptions;

import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionCreateDTO;
import com.br.uvaproject.saasuntitled.internal.subscriptions.dto.SubscriptionUpdateDTO;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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

    private User testUser;

    @BeforeEach
    void setUp() {
        subscriptionRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setPasswordHash(passwordEncoder.encode("123456"));
        userRepository.save(testUser);
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
                "Monthly"
        );

        mockMvc.perform(post("/api/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Netflix"))
                .andExpect(jsonPath("$.price").value(29.90))
                .andExpect(jsonPath("$.category").value("Streaming"))
                .andExpect(jsonPath("$.plan").value("Monthly"));
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void getMySubscriptions_ShouldReturnList() throws Exception {
        SubscriptionCreateDTO createDTO = new SubscriptionCreateDTO(
                "Spotify",
                BigDecimal.valueOf(19.90),
                LocalDate.now().plusDays(30),
                "Music",
                LocalDate.now(),
                "Monthly"
        );

        mockMvc.perform(post("/api/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/subscriptions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Spotify"))
                .andExpect(jsonPath("$[0].price").value(19.90));
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void updateSubscription_ShouldReturnNoContent() throws Exception {
        SubscriptionCreateDTO createDTO = new SubscriptionCreateDTO(
                "HBO Max",
                BigDecimal.valueOf(49.90),
                LocalDate.now().plusDays(30),
                "Streaming",
                LocalDate.now(),
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

        SubscriptionUpdateDTO updateDTO = new SubscriptionUpdateDTO(
                "HBO Max Updated",
                BigDecimal.valueOf(39.90),
                LocalDate.now().plusDays(60),
                "Streaming",
                "Monthly",
                LocalDate.now()
        );

        mockMvc.perform(put("/api/subscriptions/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isNoContent());
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
    }
}
