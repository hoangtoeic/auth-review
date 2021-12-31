import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto, updateUserDto } from './dto';
import {getConnection} from "typeorm"; 
import { User } from 'src/db/entities/user.entity';
import { ConnectionDB } from 'src/connectionDB/connectionDB';
import {ConnectionManager, Repository,Connection,EntityManager} from 'typeorm'
import { InjectRepository,InjectConnection, InjectEntityManager } from '@nestjs/typeorm';
import { use } from 'passport';
import { targetModulesByContainer } from '@nestjs/core/router/router-module';



@Injectable()
export class AuthService {
 
  constructor()
  {}
  async register( payload: RegisterDto) {
    const {email, firstName, lastName, password, roleName} = payload

    const  connectionDB = await ConnectionDB()
    const user =await this.findUserByEmail(email)
    
    if( user) throw new ForbiddenException('user existed, please change your email')
   
    await connectionDB
    .createQueryBuilder()
    .insert()
    .into(User)
    .values([
        { firstName: firstName,
           lastName: lastName,
           email: email,
           password: password,
          roleName: roleName}, 
        
     ])
    .execute();
    // return payload
   // const user = await this.userRepository.findOne(email) 
   // return user
  }

  async deleteUser(id: number) {
    const connectionDB = await ConnectionDB()
   // const connectionDB = await connectionUser()
    console.log('deleteUser')
    await connectionDB
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :id", { id: id })
    .execute();
  
  }


  async UpdateUser(id: number, attrs: Partial<User>) {
    // check if user exist
    const connectionDB = await ConnectionDB()
    // const connectionDB = await connectionUser()

   const user =await this.findUserbyID(id)
   for (var key of Object.keys(attrs)) {
    if(!(Object.keys(user).includes(key)))
  throw new BadRequestException('Please check property of object');
}

    Object.assign(user, attrs) // copy tu attrs qua user
   // return this.repo.save(user);
   await connectionDB
    .createQueryBuilder()
    .insert()
    .into(User)
    .values([
        { firstName: user.firstName,
           lastName: user.lastName,
           email: user.email,
           password: user.password,
          roleName: user.roleName}, 
        
     ])
    .execute();
    return user;
  }

  async findUserbyID(id: number){
    const connectionDB = await ConnectionDB()
    // const connectionDB = await connectionUser()

    const user = await connectionDB
    .createQueryBuilder()
    .select("User")
    .from( User, "User")
    .where("id = :id", {  id })
    .getOne();
   
    if(!user) {
      throw new NotFoundException('user is not exists')
    }
    return user
    
  }

  async findUserByEmail(email: string){
    const connectionDB = await ConnectionDB()
    // const connectionDB = await connectionUser()

    const user = await connectionDB
    .createQueryBuilder() 
    .select("User")
    .from( User, "User")
    .where("email = :email", { email }).getOne();
    if( user) {
    //  console.log(true)
       return  true
      } 
    else
    {
    //  console.log(false)
       return false
      }
  }


   
}
