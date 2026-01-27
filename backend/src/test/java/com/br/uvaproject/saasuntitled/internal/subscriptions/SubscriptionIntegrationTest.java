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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
                "Monthly",
                "icon"
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
                .andExpect(jsonPath("$.period").value("Monthly"))
                .andExpect(jsonPath("$.icon").value("icon"));
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void createSubscription_InvalidName_ShouldReturnBadRequest() throws Exception {
        SubscriptionCreateDTO createDTO = new SubscriptionCreateDTO(
                "",
                BigDecimal.valueOf(29.90),
                LocalDate.now().plusDays(30),
                "Streaming",
                LocalDate.now(),
                "Premium",
                "Monthly",
                "icon"
        );

        mockMvc.perform(post("/api/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void updateSubscription_ShouldReturnOk() throws Exception {

        SubscriptionCreateDTO createDTO = new SubscriptionCreateDTO(
                "Netflix",
                BigDecimal.valueOf(29.90),
                LocalDate.now().plusDays(30),
                "Streaming",
                LocalDate.now(),
                "Premium",
                "Monthly",
                "icon"
        );

        String response = mockMvc.perform(post("/api/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String subscriptionId = objectMapper.readTree(response).get("id").asText();

        SubscriptionUpdateDTO updateDTO = new SubscriptionUpdateDTO(
                "Netflix Updated",
                BigDecimal.valueOf(39.90),
                LocalDate.now().plusDays(60),
                "Streaming Updated",
                "Premium",
                "Monthly",
                "icon",
                LocalDate.now().plusDays(60)
        );

        mockMvc.perform(put("/api/subscriptions/" + subscriptionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Netflix Updated"))
                .andExpect(jsonPath("$.price").value(39.90))
                .andExpect(jsonPath("$.category").value("Streaming Updated"));
    }


    @Test
    void updateSubscription_NotOwned_ShouldReturnNotFound() throws Exception {

        User owner = new User();
        owner.setEmail("owner@example.com");
        owner.setName("Owner User");
        owner.setPasswordHash(passwordEncoder.encode("123456"));
        userRepository.save(owner);

        User anotherUser = new User();
        anotherUser.setEmail("another@example.com");
        anotherUser.setName("Another User");
        anotherUser.setPasswordHash(passwordEncoder.encode("123456"));
        userRepository.save(anotherUser);

        SubscriptionCreateDTO createDTO = new SubscriptionCreateDTO(
                "Disney+",
                BigDecimal.valueOf(27.90),
                LocalDate.now().plusDays(30),
                "Streaming",
                LocalDate.now(),
                "Premium",
                "Monthly",
                "icon"
        );

        String response = mockMvc.perform(post("/api/subscriptions")
                        .with(user(owner.getEmail()).roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String subscriptionId = objectMapper.readTree(response).get("id").asText();

        SubscriptionUpdateDTO updateDTO = new SubscriptionUpdateDTO(
                "Disney Updated",
                BigDecimal.valueOf(37.90),
                LocalDate.now().plusDays(60),
                "Streaming Updated",
                "Premium",
                "Monthly",
                "icon",
                LocalDate.now().plusDays(60)
        );

        mockMvc.perform(put("/api/subscriptions/" + subscriptionId)
                        .with(user(anotherUser.getEmail()).roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/subscriptions")
                        .with(user(owner.getEmail()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Disney+"))
                .andExpect(jsonPath("$[0].price").value(27.90));
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
                "Monthly",
                "icon"
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

    @Test
    void deleteSubscription_NotOwned_ShouldReturnNotFound() throws Exception {

        User owner = new User();
        owner.setEmail("owner@example.com");
        owner.setName("Owner User");
        owner.setPasswordHash(passwordEncoder.encode("123456"));
        userRepository.save(owner);

        User anotherUser = new User();
        anotherUser.setEmail("another@example.com");
        anotherUser.setName("Another User");
        anotherUser.setPasswordHash(passwordEncoder.encode("123456"));
        userRepository.save(anotherUser);

        SubscriptionCreateDTO createDTO = new SubscriptionCreateDTO(
                "Disney+",
                BigDecimal.valueOf(27.90),
                LocalDate.now().plusDays(30),
                "Streaming",
                LocalDate.now(),
                "Premium",
                "Monthly",
                "icon"
        );

        String response = mockMvc.perform(post("/api/subscriptions")
                        .with(user(owner.getEmail()).roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                        .andExpect(status().isCreated())
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

        String subscriptionId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(delete("/api/subscriptions/" + subscriptionId)
                        .with(user(anotherUser.getEmail()).roles("USER")))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/subscriptions")
                        .with(user(owner.getEmail()).roles("USER")))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].id").value(subscriptionId));
    }
}
