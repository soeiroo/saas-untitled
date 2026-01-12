package com.br.uvaproject.saasuntitled.internal.shared.errors;

import java.time.LocalDateTime;

public record ApiErrorDTO(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp
) {}
