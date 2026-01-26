package com.br.uvaproject.saasuntitled.internal.friends;

import com.br.uvaproject.saasuntitled.internal.friends.dto.FriendRequestDTO;
import com.br.uvaproject.saasuntitled.internal.friends.mapper.FriendMapper;
import com.br.uvaproject.saasuntitled.internal.users.User;
import com.br.uvaproject.saasuntitled.internal.users.dto.UserSearchResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendService {

    private final UserFriendRepository userFriendRepository;

    public void sendFriendRequest(User currentUser, UUID friendId) {
        if (currentUser.getId().equals(friendId)) {
            throw new IllegalArgumentException("Não é possível adicionar você mesmo.");
        }

        boolean exists = userFriendRepository.findByUserIdAndFriendId(currentUser.getId(), friendId).isPresent()
                || userFriendRepository.findByUserIdAndFriendId(friendId, currentUser.getId()).isPresent();

        if (exists) {
            throw new IllegalStateException("Já existe um pedido ou amizade entre esses usuários.");
        }

        UserFriend request = new UserFriend();
        request.setUser(currentUser);

        User friend = new User();
        friend.setId(friendId);
        request.setFriend(friend);

        request.setStatus(FriendStatus.PENDING);

        userFriendRepository.save(request);
    }

    public void acceptFriendRequest(User currentUser, UUID requestId) {
        UserFriend request = userFriendRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido de amizade não encontrado"));

        if (!request.getFriend().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Você não pode aceitar este pedido.");
        }

        request.setStatus(FriendStatus.ACCEPTED);
        userFriendRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<FriendRequestDTO> listPendingRequests(User currentUser) {
        return userFriendRepository.findByFriendIdAndStatus(currentUser.getId(), FriendStatus.PENDING)
                .stream()
                .map(FriendMapper::toRequestDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponseDTO> listFriends(User currentUser) {
        return userFriendRepository.findByStatusAndUserIdOrFriendId(
                        FriendStatus.ACCEPTED,
                        currentUser.getId(),
                        currentUser.getId()
                )
                .stream()
                .map(uf -> {
                    User friend = uf.getUser().getId().equals(currentUser.getId())
                            ? uf.getFriend()
                            : uf.getUser();
                    return new UserSearchResponseDTO(friend.getId(), friend.getName(), friend.getEmail());
                })
                .collect(Collectors.toList());
    }

    public void removeFriend(User currentUser, UUID friendId) {
        UserFriend friendship = userFriendRepository.findByUserIdAndFriendId(currentUser.getId(), friendId)
                .or(() -> userFriendRepository.findByUserIdAndFriendId(friendId, currentUser.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Amizade não encontrada"));

        userFriendRepository.delete(friendship);
    }
}
