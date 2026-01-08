package com.br.uvaproject.saasuntitled.internal.users;

import com.br.uvaproject.saasuntitled.internal.users.dto.UserCreateDTO;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.users.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User create(UserCreateDTO dto) {
        String hash = passwordEncoder.encode(dto.password());
        User user = UserMapper.fromCreateDTO(dto, hash);
        return userRepository.save(user);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User update(UUID id, UserUpdateDTO dto) {
        User user = findById(id);

        if (dto.email() != null) user.setEmail(dto.email());
        if (dto.name() != null) user.setName(dto.name());
        if (dto.password() != null && !dto.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(dto.password()));
        }

        return userRepository.save(user);
    }

    public void delete(UUID id) {
        userRepository.deleteById(id);
    }
}
