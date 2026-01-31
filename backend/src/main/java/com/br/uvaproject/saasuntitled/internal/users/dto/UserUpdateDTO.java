package com.br.uvaproject.saasuntitled.internal.users.dto;

public record UserUpdateDTO(
        String email,
        String name,
        String password,
        String profilePicture
) {}
