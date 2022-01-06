import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { User } from "./user.entity";

@Entity('UserRole')
export class UserRole extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number

  @ManyToOne(() => User, user => user.userRole)
  @JoinColumn({name: 'token_id'})
  user: User

  @ManyToOne(() => Role, role => role.userRole)
  @JoinColumn({name: 'user_id'})
  role: Role
}