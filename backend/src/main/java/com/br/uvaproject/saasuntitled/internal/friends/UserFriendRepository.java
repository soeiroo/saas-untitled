package com.br.uvaproject.saasuntitled.internal.friends;

import com.br.uvaproject.saasuntitled.internal.friends.FriendStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserFriendRepository extends JpaRepository<UserFriend, UUID> {

    Optional<UserFriend> findByUserIdAndFriendId(UUID userId, UUID friendId);

    List<UserFriend> findByFriendIdAndStatus(UUID friendId, FriendStatus status);

    List<UserFriend> findByStatusAndUserIdOrFriendId(
            FriendStatus status,
            UUID userId,
            UUID friendId
    );
}
