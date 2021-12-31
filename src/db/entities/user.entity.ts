import { Entity,BaseEntity  } from 'typeorm';
import { Column, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

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

  @Column({name: 'roleName',type: "enum",enum: ROLE})
  roleName!: ROLE
  
  @Column()
    refreshtoken:string;
 
 @Column()
    refreshtokenexpires:string;
}