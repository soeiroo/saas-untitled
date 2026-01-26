package com.br.uvaproject.saasuntitled.internal.users;

import com.br.uvaproject.saasuntitled.internal.users.dto.UserCreateDTO;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserSearchResponseDTO;
import com.br.uvaproject.saasuntitled.internal.users.mapper.UserMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public User create(UserCreateDTO dto) {

        if (dto.email() == null || dto.email().isBlank()) {
            throw new IllegalArgumentException("O email não pode estar vazio");
        }

        if (dto.password() == null || dto.password().isBlank()) {
            throw new IllegalArgumentException("A senha não pode estar vazia");
        }

        if (userRepository.findByEmail(dto.email()).isPresent()) {
            throw new IllegalStateException("Email já está em uso");
        }

        String hash = passwordEncoder.encode(dto.password());
        User user = UserMapper.fromCreateDTO(dto, hash);

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User authenticate(String email, String password) {

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("O email não pode estar vazio");
        }

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("A senha não pode estar vazia");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Email ou senha inválidos");
        }

        return user;
    }

    @Transactional(readOnly = true)
    public User getMe(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }

    public User updateMe(String email, UserUpdateDTO dto) {

        User user = getMe(email);

        if (dto.email() != null) {
            if (dto.email().isBlank()) {
                throw new IllegalArgumentException("O email não pode estar vazio");
            }

            userRepository.findByEmail(dto.email())
                    .filter(u -> !u.getId().equals(user.getId()))
                    .ifPresent(u -> {
                        throw new IllegalStateException("Email já está em uso");
                    });

            user.setEmail(dto.email());
        }

        if (dto.name() != null) {
            user.setName(dto.name());
        }

        if (dto.password() != null) {
            if (dto.password().isBlank()) {
                throw new IllegalArgumentException("A senha não pode estar vazia");
            }
            user.setPasswordHash(passwordEncoder.encode(dto.password()));
        }

        return userRepository.save(user);
    }

    public void deleteMe(String email) {
        User user = getMe(email);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponseDTO> searchUsersExcludingFriends(String query, User user) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        return userRepository
                .searchUsersExcludingFriends(
                        query,
                        user.getEmail(),
                        user.getId()
                )
                .stream()
                .map(UserMapper::toSearchResponse)
                .toList();
    }
}
