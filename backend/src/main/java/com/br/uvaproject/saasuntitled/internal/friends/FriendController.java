package com.br.uvaproject.saasuntitled.internal.friends;

import com.br.uvaproject.saasuntitled.internal.friends.dto.FriendRequestDTO;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserSearchResponseDTO;
import com.br.uvaproject.saasuntitled.internal.users.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final UserService userService;

    @PostMapping("/{friendId}")
    public ResponseEntity<Void> sendFriendRequest(
            @PathVariable UUID friendId,
            Authentication authentication
    ) {
        User currentUser = userService.getMe(authentication.getName());
        friendService.sendFriendRequest(currentUser, friendId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<Void> acceptFriendRequest(
            @PathVariable UUID requestId,
            Authentication authentication
    ) {
        User currentUser = userService.getMe(authentication.getName());
        friendService.acceptFriendRequest(currentUser, requestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendRequestDTO>> listPendingRequests(
            Authentication authentication
    ) {
        User currentUser = userService.getMe(authentication.getName());
        List<FriendRequestDTO> requests = friendService.listPendingRequests(currentUser);
        return ResponseEntity.ok(requests);
    }

    @GetMapping
    public ResponseEntity<List<UserSearchResponseDTO>> listFriends(
            Authentication authentication
    ) {
        User currentUser = userService.getMe(authentication.getName());
        List<UserSearchResponseDTO> friends = friendService.listFriends(currentUser);
        return ResponseEntity.ok(friends);
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(
            @PathVariable UUID friendId,
            Authentication authentication
    ) {
        User currentUser = userService.getMe(authentication.getName());
        friendService.removeFriend(currentUser, friendId);
        return ResponseEntity.noContent().build();
    }
}
