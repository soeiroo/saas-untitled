package com.br.uvaproject.saasuntitled.internal.users;

import com.br.uvaproject.saasuntitled.internal.users.dto.UserCreateDTO;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserUpdateDTO;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserRepository userRepository;
    private BCryptPasswordEncoder passwordEncoder;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(BCryptPasswordEncoder.class);
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void authenticate_Success() {
        User user = new User();
        user.setEmail("alice@example.com");
        user.setPasswordHash("hashed");

        when(userRepository.findByEmail("alice@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123", "hashed"))
                .thenReturn(true);

        User result = userService.authenticate("alice@example.com", "123");

        assertEquals("alice@example.com", result.getEmail());
    }

    @Test
    void authenticate_InvalidPassword_Throws() {
        User user = new User();
        user.setPasswordHash("hashed");

        when(userRepository.findByEmail("alice@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any()))
                .thenReturn(false);

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> userService.authenticate("alice@example.com", "wrong")
        );

        assertEquals("Email ou senha inválidos", ex.getMessage());
    }

    @Test
    void getMe_UserExists() {
        User user = new User();
        user.setEmail("me@example.com");

        when(userRepository.findByEmail("me@example.com"))
                .thenReturn(Optional.of(user));

        User result = userService.getMe("me@example.com");

        assertEquals("me@example.com", result.getEmail());
    }

    @Test
    void getMe_NotFound_Throws() {
        when(userRepository.findByEmail(any()))
                .thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> userService.getMe("x@y.com")
        );

        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    void updateMe_UpdatesFieldsCorrectly() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("old@example.com");

        when(userRepository.findByEmail("old@example.com"))
                .thenReturn(Optional.of(user));
        when(userRepository.findByEmail("new@example.com"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode("123"))
                .thenReturn("hashed");
        when(userRepository.save(any()))
                .thenAnswer(inv -> inv.getArgument(0));

        UserUpdateDTO dto =
                new UserUpdateDTO("new@example.com", "New", "123");

        User updated = userService.updateMe("old@example.com", dto);

        assertEquals("new@example.com", updated.getEmail());
        assertEquals("New", updated.getName());
        assertEquals("hashed", updated.getPasswordHash());
    }

    @Test
    void updateMe_EmailAlreadyInUse_Throws() {
        UUID currentUserId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        User currentUser = new User();
        currentUser.setId(currentUserId);
        currentUser.setEmail("old@example.com");

        User otherUser = new User();
        otherUser.setId(otherUserId);
        otherUser.setEmail("new@example.com");

        when(userRepository.findByEmail("old@example.com"))
                .thenReturn(Optional.of(currentUser));

        when(userRepository.findByEmail("new@example.com"))
                .thenReturn(Optional.of(otherUser));

        UserUpdateDTO dto =
                new UserUpdateDTO("new@example.com", "New", null);

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> userService.updateMe("old@example.com", dto)
        );

        assertEquals("Email já está em uso", ex.getMessage());

        verify(userRepository, never()).save(any());
    }

    @Test
    void deleteMe_DeletesUser() {
        User user = new User();
        user.setEmail("me@example.com");

        when(userRepository.findByEmail("me@example.com"))
                .thenReturn(Optional.of(user));

        userService.deleteMe("me@example.com");

        verify(userRepository).delete(user);
    }

    @Test
    void deleteMe_UserNotFound_Throws() {
        when(userRepository.findByEmail("missing@example.com"))
        .thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> userService.deleteMe("missing@example.com")
        );

        assertEquals("Usuário não encontrado", ex.getMessage());

        verify(userRepository, never()).delete(any());
    }
}
