export interface Friend {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  addedAt?: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
}

export interface FriendRequest {
  requestId: string;
  userId: string;
  name: string;
  email: string;
  profilePicture?: string;
}
