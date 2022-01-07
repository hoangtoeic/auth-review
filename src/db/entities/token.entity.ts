import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('Token')
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number

  @Column()
  refreshToken: string

  @Column()
  refreshTokenExpired: string

  @Column()
  resetToken: string

  @Column()
  resetTokenExpired: string

  @Column()
  userId: number

  @OneToOne(() => User, user => user.token)
  @JoinColumn({name: 'userId'})
  user: User
}