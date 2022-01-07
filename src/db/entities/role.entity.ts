import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./user-role.entity";
import { User } from "./user.entity";

export enum ROLE{
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN'
}

@Entity('Role')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: number

  @Column({name: 'name',type: "enum",enum: ROLE, unique: true})
  name!: ROLE

  @OneToMany(() => UserRole, userRole => userRole.role,
   )
   userRole: UserRole[]
}
