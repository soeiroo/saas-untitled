export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  profilePicture?: string;
}
