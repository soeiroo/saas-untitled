package com.br.uvaproject.saasuntitled.internal.friends;

import com.br.uvaproject.saasuntitled.internal.friends.dto.FriendRequestDTO;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserSearchResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FriendServiceTest {

    private UserFriendRepository userFriendRepository;
    private FriendService friendService;

    private User user;
    private User friend;

    @BeforeEach
    void setUp() {
        userFriendRepository = mock(UserFriendRepository.class);
        friendService = new FriendService(userFriendRepository);

        user = new User();
        user.setId(UUID.randomUUID());
        user.setName("User A");
        user.setEmail("a@example.com");

        friend = new User();
        friend.setId(UUID.randomUUID());
        friend.setName("User B");
        friend.setEmail("b@example.com");
    }

    @Test
    void sendFriendRequest_Success() {
        when(userFriendRepository.findByUserIdAndFriendId(user.getId(), friend.getId()))
                .thenReturn(Optional.empty());
        when(userFriendRepository.findByUserIdAndFriendId(friend.getId(), user.getId()))
                .thenReturn(Optional.empty());

        assertDoesNotThrow(() -> friendService.sendFriendRequest(user, friend.getId()));

        verify(userFriendRepository).save(any(UserFriend.class));
    }

    @Test
    void sendFriendRequest_ToSelf_Throws() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> friendService.sendFriendRequest(user, user.getId())
        );
        assertEquals("Não é possível adicionar você mesmo.", ex.getMessage());
    }

    @Test
    void sendFriendRequest_AlreadyExists_Throws() {
        when(userFriendRepository.findByUserIdAndFriendId(user.getId(), friend.getId()))
                .thenReturn(Optional.of(new UserFriend()));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> friendService.sendFriendRequest(user, friend.getId())
        );
        assertEquals("Já existe um pedido ou amizade entre esses usuários.", ex.getMessage());
    }

    @Test
    void acceptFriendRequest_Success() {
        UUID requestId = UUID.randomUUID();
        UserFriend request = new UserFriend();
        request.setId(requestId);
        request.setFriend(user);
        request.setUser(friend);
        request.setStatus(FriendStatus.PENDING);

        when(userFriendRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        assertDoesNotThrow(() -> friendService.acceptFriendRequest(user, requestId));
        assertEquals(FriendStatus.ACCEPTED, request.getStatus());
        verify(userFriendRepository).save(request);
    }

    @Test
    void acceptFriendRequest_NotAuthorized_Throws() {
        UUID requestId = UUID.randomUUID();
        UserFriend request = new UserFriend();
        request.setId(requestId);
        request.setFriend(friend);
        request.setUser(user);
        request.setStatus(FriendStatus.PENDING);

        when(userFriendRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> friendService.acceptFriendRequest(user, requestId)
        );
        assertEquals("Você não pode aceitar este pedido.", ex.getMessage());
    }

    @Test
    void acceptFriendRequest_NotFound_Throws() {
        UUID requestId = UUID.randomUUID();
        when(userFriendRepository.findById(requestId)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> friendService.acceptFriendRequest(user, requestId)
        );
        assertEquals("Pedido de amizade não encontrado", ex.getMessage());
    }

    @Test
    void listPendingRequests_ReturnsDTOs() {
        UserFriend uf = new UserFriend();
        uf.setId(UUID.randomUUID());
        uf.setUser(friend);
        uf.setFriend(user);
        uf.setStatus(FriendStatus.PENDING);

        when(userFriendRepository.findByFriendIdAndStatus(user.getId(), FriendStatus.PENDING))
                .thenReturn(List.of(uf));

        List<FriendRequestDTO> requests = friendService.listPendingRequests(user);
        assertEquals(1, requests.size());
        assertEquals(friend.getId(), requests.get(0).userId());
        assertEquals(friend.getName(), requests.get(0).name());
        assertEquals(friend.getEmail(), requests.get(0).email());
    }

    @Test
    void listFriends_ReturnsDTOs() {
        UserFriend uf = new UserFriend();
        uf.setId(UUID.randomUUID());
        uf.setUser(user);
        uf.setFriend(friend);
        uf.setStatus(FriendStatus.ACCEPTED);

        when(userFriendRepository.findByStatusAndUserIdOrFriendId(
                        FriendStatus.ACCEPTED, user.getId(), user.getId()))
                .thenReturn(List.of(uf));

        List<UserSearchResponseDTO> friends = friendService.listFriends(user);
        assertEquals(1, friends.size());
        assertEquals(friend.getId(), friends.get(0).id());
        assertEquals(friend.getName(), friends.get(0).name());
        assertEquals(friend.getEmail(), friends.get(0).email());
    }

    @Test
    void removeFriend_Success() {
        UserFriend uf = new UserFriend();
        uf.setId(UUID.randomUUID());
        uf.setUser(user);
        uf.setFriend(friend);

        when(userFriendRepository.findByUserIdAndFriendId(user.getId(), friend.getId()))
                .thenReturn(Optional.of(uf));

        assertDoesNotThrow(() -> friendService.removeFriend(user, friend.getId()));
        verify(userFriendRepository).delete(uf);
    }

    @Test
    void removeFriend_NotFound_Throws() {
        when(userFriendRepository.findByUserIdAndFriendId(user.getId(), friend.getId()))
                .thenReturn(Optional.empty());
        when(userFriendRepository.findByUserIdAndFriendId(friend.getId(), user.getId()))
                .thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> friendService.removeFriend(user, friend.getId())
        );
        assertEquals("Amizade não encontrada", ex.getMessage());
    }
}
