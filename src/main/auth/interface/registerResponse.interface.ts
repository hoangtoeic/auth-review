import { Role } from "src/db/entities/role.entity";
import { UserData } from "./userData.interface";

export interface RegisterResponse {
  user: UserData,
  accessToken: string,
  refreshToken: string,
}