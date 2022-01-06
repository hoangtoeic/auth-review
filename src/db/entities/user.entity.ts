import { join } from 'path/posix';
import { Entity,BaseEntity, JoinColumn, ManyToMany, OneToMany, OneToOne  } from 'typeorm';
import { Column, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Role } from './role.entity';
import { Token } from './token.entity';
import { UserRole } from './user-role.entity';

export enum ROLE{
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN'
}
@Entity('User') 
export class User extends BaseEntity{
  @PrimaryGeneratedColumn('uuid')
  id: number

  @Column()
  email!: string

  @Column()
  firstName!: string

  @Column()
  lastName!: string

  @Column()
  password!: string

  // @Column({name: 'roleName',type: "enum",enum: ROLE})
  // roleName!: ROLE
  
  // @Column()
  // refreshToken: string;
 
  // @Column()
  // refreshTokenExpired: string;

  @OneToMany(() => UserRole, userRole => userRole.user)
  userRole: UserRole[]

  @OneToOne(() => Token, token => token.user)
  token: Token
}