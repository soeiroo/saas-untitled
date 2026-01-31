export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}
