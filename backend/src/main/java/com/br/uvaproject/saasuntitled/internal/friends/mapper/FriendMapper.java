package com.br.uvaproject.saasuntitled.internal.friends.mapper;

import com.br.uvaproject.saasuntitled.internal.friends.UserFriend;
import com.br.uvaproject.saasuntitled.internal.friends.dto.FriendRequestDTO;

public class FriendMapper {

    public static FriendRequestDTO toRequestDTO(UserFriend uf) {
        return new FriendRequestDTO(
                uf.getId(),
                uf.getUser().getId(),
                uf.getUser().getName(),
                uf.getUser().getEmail()
        );
    }

    public static FriendRequestDTO toSentRequestDTO(UserFriend uf) {
        return new FriendRequestDTO(
                uf.getId(),
                uf.getFriend().getId(),
                uf.getFriend().getName(),
                uf.getFriend().getEmail()
        );
    }
}
