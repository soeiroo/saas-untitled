package com.br.uvaproject.saasuntitled.internal.subscriptions.friends.mapper;

import com.br.uvaproject.saasuntitled.internal.subscriptions.friends.SubscriptionFriend;
import com.br.uvaproject.saasuntitled.internal.subscriptions.friends.dto.SubscriptionFriendResponseDTO;

public class SubscriptionFriendMapper {

    public static SubscriptionFriendResponseDTO toResponse(SubscriptionFriend sf) {
        return new SubscriptionFriendResponseDTO(
                sf.getFriend().getId(),
                sf.getFriend().getName(),
                sf.getFriend().getEmail(),
                sf.getFriend().getProfilePicture(),
                sf.getPrice()
        );
    }
}
