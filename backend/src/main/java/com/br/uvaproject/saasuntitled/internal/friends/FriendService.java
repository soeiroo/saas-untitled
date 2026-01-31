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

    public void sendFriendRequest(User user, UUID friendId) {
        if (user.getId().equals(friendId)) {
            throw new IllegalArgumentException("Não é possível adicionar você mesmo.");
        }

        boolean exists = userFriendRepository.findByUserIdAndFriendId(user.getId(), friendId).isPresent()
                || userFriendRepository.findByUserIdAndFriendId(friendId, user.getId()).isPresent();

        if (exists) {
            throw new IllegalStateException("Já existe um pedido ou amizade entre esses usuários.");
        }

        UserFriend request = new UserFriend();
        request.setUser(user);

        User friend = new User();
        friend.setId(friendId);
        request.setFriend(friend);

        request.setStatus(FriendStatus.PENDING);

        userFriendRepository.save(request);
    }

    public void acceptFriendRequest(User user, UUID requestId) {
        UserFriend request = userFriendRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido de amizade não encontrado"));

        if (!request.getFriend().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Você não pode aceitar este pedido.");
        }

        request.setStatus(FriendStatus.ACCEPTED);
        userFriendRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<FriendRequestDTO> listPendingRequests(User user) {
        return userFriendRepository.findByFriendIdAndStatus(user.getId(), FriendStatus.PENDING)
                .stream()
                .map(FriendMapper::toRequestDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendRequestDTO> listSentPendingRequests(User user) {
        return userFriendRepository
                .findByUserIdAndStatus(user.getId(), FriendStatus.PENDING)
                .stream()
                .map(FriendMapper::toSentRequestDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserSearchResponseDTO> listFriends(User user) {
        return userFriendRepository.findByStatusAndUserIdOrFriendId(
                        FriendStatus.ACCEPTED,
                        user.getId(),
                        user.getId()
                )
                .stream()
                .map(uf -> {
                    User friend = uf.getUser().getId().equals(user.getId())
                            ? uf.getFriend()
                            : uf.getUser();
                    return new UserSearchResponseDTO(friend.getId(), friend.getName(), friend.getEmail(), friend.getProfilePicture());
                })
                .collect(Collectors.toList());
    }

    public void removeFriend(User user, UUID friendId) {
        UserFriend friendship = userFriendRepository.findByUserIdAndFriendId(user.getId(), friendId)
                .or(() -> userFriendRepository.findByUserIdAndFriendId(friendId, user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Amizade não encontrada"));

        userFriendRepository.delete(friendship);
    }
}
