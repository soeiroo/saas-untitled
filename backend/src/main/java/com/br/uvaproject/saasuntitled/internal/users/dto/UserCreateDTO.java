package com.br.uvaproject.saasuntitled.internal.users.dto;

public record UserCreateDTO(
        String email,
        String password,
        String name
) {}
