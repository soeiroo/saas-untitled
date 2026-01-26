package com.br.uvaproject.saasuntitled.internal.friends;

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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FriendControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFriendRepository userFriendRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        userFriendRepository.deleteAll();
        userRepository.deleteAll();

        userA = new User();
        userA.setEmail("a@example.com");
        userA.setName("User A");
        userA.setPasswordHash(passwordEncoder.encode("123456"));
        userRepository.save(userA);

        userB = new User();
        userB.setEmail("b@example.com");
        userB.setName("User B");
        userB.setPasswordHash(passwordEncoder.encode("123456"));
        userRepository.save(userB);
    }

    @Test
    void sendFriendRequest_ShouldSucceed() throws Exception {
        mockMvc.perform(post("/api/friends/" + userB.getId())
                        .with(user(userA.getEmail()).roles("USER")))
                .andExpect(status().isOk());

        assertThat(userFriendRepository.findAll()).hasSize(1);
    }

    @Test
    void sendFriendRequest_ToSelf_ShouldFail() throws Exception {
        mockMvc.perform(post("/api/friends/" + userA.getId())
                        .with(user(userA.getEmail()).roles("USER")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void acceptFriendRequest_ShouldSucceed() throws Exception {
        mockMvc.perform(post("/api/friends/" + userB.getId())
                        .with(user(userA.getEmail()).roles("USER")))
                .andExpect(status().isOk());

        UUID requestId = userFriendRepository.findAll().get(0).getId();

        mockMvc.perform(post("/api/friends/accept/" + requestId)
                        .with(user(userB.getEmail()).roles("USER")))
                .andExpect(status().isOk());

        assertThat(userFriendRepository.findById(requestId).get().getStatus())
                .isEqualTo(FriendStatus.ACCEPTED);
    }

    @Test
    void acceptFriendRequest_NotAuthorized_ShouldFail() throws Exception {
        mockMvc.perform(post("/api/friends/" + userB.getId())
                        .with(user(userA.getEmail()).roles("USER")))
                .andExpect(status().isOk());

        UUID requestId = userFriendRepository.findAll().get(0).getId();

        mockMvc.perform(post("/api/friends/accept/" + requestId)
                        .with(user(userA.getEmail()).roles("USER")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listPendingRequests_ShouldReturnDTOs() throws Exception {
        UserFriend uf = new UserFriend();
        uf.setUser(userA);
        uf.setFriend(userB);
        uf.setStatus(FriendStatus.PENDING);
        userFriendRepository.save(uf);

        mockMvc.perform(get("/api/friends/requests")
                        .with(user(userB.getEmail()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(userA.getId().toString()))
                .andExpect(jsonPath("$[0].name").value(userA.getName()))
                .andExpect(jsonPath("$[0].email").value(userA.getEmail()));
    }

    @Test
    void listFriends_ShouldReturnAccepted() throws Exception {
        UserFriend uf = new UserFriend();
        uf.setUser(userA);
        uf.setFriend(userB);
        uf.setStatus(FriendStatus.ACCEPTED);
        userFriendRepository.save(uf);

        mockMvc.perform(get("/api/friends")
                        .with(user(userA.getEmail()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(userB.getId().toString()));

        mockMvc.perform(get("/api/friends")
                        .with(user(userB.getEmail()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(userA.getId().toString()));
    }

    @Test
    void removeFriend_ShouldSucceed() throws Exception {
        UserFriend uf = new UserFriend();
        uf.setUser(userA);
        uf.setFriend(userB);
        uf.setStatus(FriendStatus.ACCEPTED);
        userFriendRepository.save(uf);

        mockMvc.perform(delete("/api/friends/" + userB.getId())
                        .with(user(userA.getEmail()).roles("USER")))
                .andExpect(status().isNoContent());

        assertThat(userFriendRepository.findAll()).isEmpty();
    }

    @Test
    void removeFriend_NotFound_ShouldFail() throws Exception {
        mockMvc.perform(delete("/api/friends/" + UUID.randomUUID())
                        .with(user(userA.getEmail()).roles("USER")))
                .andExpect(status().isNotFound());
    }
}
