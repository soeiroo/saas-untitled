package com.br.uvaproject.saasuntitled.internal.users;

import com.br.uvaproject.saasuntitled.internal.users.dto.UserResponseDTO;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.users.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe(Authentication authentication) {
        User user = userService.getMe(authentication.getName());
        return ResponseEntity.ok(UserMapper.toResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<Void> updateMe(
            Authentication authentication,
            @RequestBody UserUpdateDTO dto
    ) {
        userService.updateMe(authentication.getName(), dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(Authentication authentication) {
        userService.deleteMe(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponseDTO>> search(
            @RequestParam String query,
            Authentication authentication
    ) {
        User user = userService.getMe(authentication.getName());

        return ResponseEntity.ok(
                userService.searchUsers(query, user)
        );
    }
}
