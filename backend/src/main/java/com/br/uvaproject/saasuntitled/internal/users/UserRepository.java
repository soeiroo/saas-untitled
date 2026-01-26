package com.br.uvaproject.saasuntitled.internal.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @Query("""
        SELECT u FROM User u
        WHERE
            (LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')))
            AND u.email <> :currentEmail
            AND u.id NOT IN (
                SELECT uf.friend.id
                FROM UserFriend uf
                WHERE uf.user.email = :currentEmail
            )
    """)
    List<User> searchUsersExcludingFriends(
            @Param("query") String query,
            @Param("currentEmail") String currentEmail
    );
}
