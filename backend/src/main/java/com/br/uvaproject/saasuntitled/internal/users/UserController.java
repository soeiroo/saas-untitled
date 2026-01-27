package com.br.uvaproject.saasuntitled.internal.users;

import com.br.uvaproject.saasuntitled.internal.security.AuthenticatedUserService;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserResponseDTO;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserUpdateDTO;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserSearchResponseDTO;
import com.br.uvaproject.saasuntitled.internal.users.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthenticatedUserService authenticatedUserService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe(Authentication authentication) {
        User user = authenticatedUserService.getUser(authentication);
        return ResponseEntity.ok(UserMapper.toResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<Void> updateMe(
            Authentication authentication,
            @RequestBody UserUpdateDTO dto
    ) {
        User user = authenticatedUserService.getUser(authentication);
        userService.updateMe(user.getEmail(), dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(Authentication authentication) {
        User user = authenticatedUserService.getUser(authentication);
        userService.deleteMe(user.getEmail());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponseDTO>> search(
            @RequestParam String query,
            Authentication authentication
    ) {
        User user = authenticatedUserService.getUser(authentication);
        return ResponseEntity.ok(
                userService.searchUsersExcludingFriends(query, user)
        );
    }
}
