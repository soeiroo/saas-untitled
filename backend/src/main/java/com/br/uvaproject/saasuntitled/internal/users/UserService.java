package com.br.uvaproject.saasuntitled.internal.users;

import com.br.uvaproject.saasuntitled.internal.users.dto.UserCreateDTO;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.users.mapper.UserMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
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

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }

    public User update(UUID id, UserUpdateDTO dto) {
        User user = findById(id);

        if (dto.email() != null) {
            if (dto.email().isBlank()) {
                throw new IllegalArgumentException("O email não pode estar vazio");
            }

            userRepository.findByEmail(dto.email())
                    .filter(u -> !u.getId().equals(id))
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

    public void delete(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("Usuário não encontrado");
        }
        userRepository.deleteById(id);
    }
}
