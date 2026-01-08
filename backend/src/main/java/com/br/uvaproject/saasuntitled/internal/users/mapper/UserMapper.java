package com.br.uvaproject.saasuntitled.internal.users.mapper;

import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserCreateDTO;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserResponseDTO;

public class UserMapper {

    public static UserResponseDTO toResponse(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public static User fromCreateDTO(UserCreateDTO dto, String passwordHash) {
        return User.builder()
                .email(dto.email())
                .passwordHash(passwordHash)
                .name(dto.name())
                .build();
    }
}
