package com.br.uvaproject.saasuntitled.internal.friends;

import com.br.uvaproject.saasuntitled.internal.friends.dto.FriendRequestDTO;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserSearchResponseDTO;
import com.br.uvaproject.saasuntitled.internal.security.AuthenticatedUserService;
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
    private final AuthenticatedUserService authenticatedUserService;

    @PostMapping("/{friendId}")
    public ResponseEntity<Void> sendFriendRequest(
            @PathVariable UUID friendId,
            Authentication authentication
    ) {
        User user = authenticatedUserService.getUser(authentication);
        friendService.sendFriendRequest(user, friendId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<Void> acceptFriendRequest(
            @PathVariable UUID requestId,
            Authentication authentication
    ) {
        User user = authenticatedUserService.getUser(authentication);
        friendService.acceptFriendRequest(user, requestId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendRequestDTO>> listPendingRequests(
            Authentication authentication
    ) {
        User user = authenticatedUserService.getUser(authentication);
        List<FriendRequestDTO> requests = friendService.listPendingRequests(user);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendRequestDTO>> listSentPendingRequests(
            Authentication authentication
    ) {
        User user = authenticatedUserService.getUser(authentication);
        List<FriendRequestDTO> requestsSent = friendService.listSentPendingRequests(user);
        return ResponseEntity.ok(requestsSent);
    }


    @GetMapping
    public ResponseEntity<List<UserSearchResponseDTO>> listFriends(
            Authentication authentication
    ) {
        User user = authenticatedUserService.getUser(authentication);
        List<UserSearchResponseDTO> friends = friendService.listFriends(user);
        return ResponseEntity.ok(friends);
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(
            @PathVariable UUID friendId,
            Authentication authentication
    ) {
        User user = authenticatedUserService.getUser(authentication);
        friendService.removeFriend(user, friendId);
        return ResponseEntity.noContent().build();
    }
}
