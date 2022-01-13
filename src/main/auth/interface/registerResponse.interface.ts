import { Role } from "src/db/entities/role.entity";

export interface UserData {
  id?: number
  email?: string
  firstName?: string
  lastName?: string
  scope: string 
}

export interface RegisterResponse {
  user: UserData,
  accessToken: string,
  refreshToken: string,
}