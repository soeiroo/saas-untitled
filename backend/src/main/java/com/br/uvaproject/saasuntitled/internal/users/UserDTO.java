package com.br.uvaproject.saasuntitled.internal.users;

import java.util.UUID;

public class UserDTO {

    private UUID id;
    private String email;
    private String name;

    // Construtor vazio (necessário para frameworks como Jackson)
    public UserDTO() {
    }

    // Construtor completo
    public UserDTO(UUID id, String email, String name) {
        this.id = id;
        this.email = email;
        this.name = name;
    }

    // Getters e Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
