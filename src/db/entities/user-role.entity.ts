import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { User } from "./user.entity";

@Entity('UserRole')
export class UserRole extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number

  @Column()
  roleId: number

  @Column()
  userId: number

  @ManyToOne(() => User, user => user.userRole)
  @JoinColumn({name: 'userId'})
  user: User

  @ManyToOne(() => Role, role => role.userRole)
  @JoinColumn({name: 'roleId'})
  role: Role
}