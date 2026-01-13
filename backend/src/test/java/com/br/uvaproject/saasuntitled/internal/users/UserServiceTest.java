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
    void createUser_Success() {
        UserCreateDTO dto =
                new UserCreateDTO("alice@example.com", "123456", "Alice");

        when(userRepository.findByEmail(dto.email()))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode(dto.password()))
                .thenReturn("hashed-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        User user = userService.create(dto);

        assertEquals("alice@example.com", user.getEmail());
        assertEquals("Alice", user.getName());
        assertEquals("hashed-password", user.getPasswordHash());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_EmptyEmail_Throws() {
        UserCreateDTO dto =
                new UserCreateDTO("", "123456", "Alice");

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> userService.create(dto));

        assertEquals("O email não pode estar vazio", ex.getMessage());
    }

    @Test
    void createUser_EmptyPassword_Throws() {
        UserCreateDTO dto =
                new UserCreateDTO("alice@example.com", "", "Alice");

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> userService.create(dto));

        assertEquals("A senha não pode estar vazia", ex.getMessage());
    }

    @Test
    void createUser_EmailAlreadyExists_Throws() {
        UserCreateDTO dto =
                new UserCreateDTO("bob@example.com", "123456", "Bob");

        when(userRepository.findByEmail(dto.email()))
                .thenReturn(Optional.of(new User()));

        IllegalStateException ex =
                assertThrows(IllegalStateException.class,
                        () -> userService.create(dto));

        assertEquals("Email já está em uso", ex.getMessage());
    }

    @Test
    void findById_UserExists() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setId(id);

        when(userRepository.findById(id))
                .thenReturn(Optional.of(user));

        User result = userService.findById(id);

        assertEquals(id, result.getId());
    }

    @Test
    void findById_UserNotFound_Throws() {
        UUID id = UUID.randomUUID();

        when(userRepository.findById(id))
                .thenReturn(Optional.empty());

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> userService.findById(id));

        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    void findAll_ReturnsList() {
        when(userRepository.findAll())
                .thenReturn(List.of(new User(), new User()));

        List<User> users = userService.findAll();

        assertEquals(2, users.size());
    }

    @Test
    void updateUser_Success() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setId(id);
        user.setEmail("old@example.com");
        user.setName("Old");
        user.setPasswordHash("old-hash");

        when(userRepository.findById(id))
                .thenReturn(Optional.of(user));
        when(userRepository.findByEmail("new@example.com"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode("newpass"))
                .thenReturn("new-hash");
        when(userRepository.save(any(User.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        UserUpdateDTO dto =
                new UserUpdateDTO("new@example.com", "New", "newpass");

        User updated = userService.update(id, dto);

        assertEquals("new@example.com", updated.getEmail());
        assertEquals("New", updated.getName());
        assertEquals("new-hash", updated.getPasswordHash());
    }

    @Test
    void updateUser_EmailAlreadyExists_Throws() {
        UUID id = UUID.randomUUID();

        User existing = new User();
        existing.setId(UUID.randomUUID());
        existing.setEmail("taken@example.com");

        User current = new User();
        current.setId(id);
        current.setEmail("old@example.com");

        when(userRepository.findById(id))
                .thenReturn(Optional.of(current));
        when(userRepository.findByEmail("taken@example.com"))
                .thenReturn(Optional.of(existing));

        UserUpdateDTO dto =
                new UserUpdateDTO("taken@example.com", null, null);

        IllegalStateException ex =
                assertThrows(IllegalStateException.class,
                        () -> userService.update(id, dto));

        assertEquals("Email já está em uso", ex.getMessage());
    }

    @Test
    void updateUser_UserNotFound_Throws() {
        UUID id = UUID.randomUUID();

        when(userRepository.findById(id))
                .thenReturn(Optional.empty());

        UserUpdateDTO dto =
                new UserUpdateDTO("new@example.com", "New", "123");

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> userService.update(id, dto));

        assertEquals("Usuário não encontrado", ex.getMessage());
    }

    @Test
    void deleteUser_Success() {
        UUID id = UUID.randomUUID();

        when(userRepository.existsById(id))
                .thenReturn(true);

        assertDoesNotThrow(() -> userService.delete(id));

        verify(userRepository).deleteById(id);
    }

    @Test
    void deleteUser_NotFound_Throws() {
        UUID id = UUID.randomUUID();

        when(userRepository.existsById(id))
                .thenReturn(false);

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> userService.delete(id));

        assertEquals("Usuário não encontrado", ex.getMessage());
    }
}
