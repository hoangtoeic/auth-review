import { BadRequestException, ForbiddenException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createRoleDto, ForgotPasswordDto, loginDto, RegisterDto, resetPasswordDto, updateUserDto } from './dto';
import {getConnection, getManager, getRepository} from "typeorm"; 
import { User } from 'src/db/entities/user.entity';
import { ConnectionDB } from 'src/connectionDB/connectionDB';
import {ConnectionManager, Repository,Connection,EntityManager} from 'typeorm'
import { InjectRepository,InjectConnection, InjectEntityManager } from '@nestjs/typeorm';
import { use } from 'passport';
import { targetModulesByContainer } from '@nestjs/core/router/router-module';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { suid } from 'rand-token';
import { saltRoundConstants } from './constant/saltRound';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { nanoid } from 'nanoid';
import { Token } from 'src/db/entities/token.entity';
import { ROLE, Role } from 'src/db/entities/role.entity';
import { UserRole } from 'src/db/entities/user-role.entity';
const userPickFields = [
  'id',
  'email',
  'firstName',
  'lastName',
];

@Injectable()
export class AuthService {

  constructor( private jwtService: JwtService)
  {}

 async createTokenAndRefreshToken({
  entityManager,
  payload,
  userId
 }: {
  entityManager?: EntityManager;
  payload: any;
  userId: number
 }) {
  const accessToken = this.jwtService.sign(payload);
  const query = entityManager
    ? entityManager.getRepository(Token)
    : getRepository(Token)
  const getOldRefreshToken = await query
    .createQueryBuilder('Token')
    .where('Token.userId = :userId', { userId })
    .andWhere('Token.refreshTokenExpired > :refreshTokenExpired', {
      refreshTokenExpired: new Date().toISOString()
    })
    .getOne();
  const refreshToken = getOldRefreshToken
    ? getOldRefreshToken.refreshToken
    : nanoid(12);
  const refreshTokenExpired = getOldRefreshToken
    ? getOldRefreshToken.refreshTokenExpired
    : new Date().toISOString()
  return {
    accessToken,
    refreshToken,
    refreshTokenExpired
  };

 }
  
 async createRole(payload: createRoleDto) {
    const { name } = payload
    return await getManager().transaction(async entityManager => {
      const createdRole = await entityManager.getRepository(Role).save(
        Role.create({ name: ROLE[name] })
      )
      return createdRole
    })
  }
 

  async register( payload: RegisterDto) {
    const {email, firstName, lastName, password, roleName} = payload
    const checkExistedUser = await User.findOne({
     where: {
       email
     }
   })
   delete payload.password;
   delete payload.roleName;

   if (checkExistedUser) {
     throw new HttpException("Email existed, please try again", 400)
   }

   const role = await Role.findOne({ where: { name: roleName } });
      if (!role) {
        throw new HttpException("Role not found, please try again", 404);
      }
     


    return await getManager().transaction(async entityManager => {
      const passwordHash = await bcrypt.hash(password, saltRoundConstants.saltRounds);
      const userInsert = await entityManager.getRepository(User).save(
        User.create({
          ...payload,
          password: passwordHash
        })
      )

      const userRole = await entityManager.getRepository(UserRole).save(
        UserRole.create({
          userId: userInsert.id,
          roleId: role.id
        })
      )
      const jwtData = {
        ..._.pick(userInsert, userPickFields),
           scope: role.name
      };

      const {
        accessToken,
        refreshToken,
        refreshTokenExpired
      } = await this.createTokenAndRefreshToken({
        entityManager,
        payload: jwtData,
        userId: userInsert.id
      });

      // const accessToken = this.jwtService.sign(jwtData);
      // const refreshToken = nanoid(12)
      // const refreshTokenExpired = new Date().toISOString()
      
      const userToken = await entityManager.getRepository(Token).findOne({
        where: {userId: userInsert.id}
      })

      const upsertTokenData = {
        userId: userInsert.id,
        accessToken,
        refreshToken,
        refreshTokenExpired,
      };

      await entityManager
        .getRepository(Token)
        .save(
          Token.merge(
            userToken ? userToken : Token.create(),upsertTokenData
          )
        )
        return {
          user: jwtData,
          accessToken,
          refreshToken
        };
    })
  }


   
    // await connectionDB
    // .createQueryBuilder()
    // .insert()
    // .into(User)
    // .values([
    //     { firstName: firstName,
    //        lastName: lastName,
    //        email: email,
    //        password: password,
    //       roleName: roleName}, 
        
    //  ])
    // .execute();
    // return payload

 

  // async deleteUser(id: number) {
  //   const connectionDB = await ConnectionDB()
  //  // const connectionDB = await connectionUser()
  //   console.log('deleteUser')
  //   await connectionDB
  //   .createQueryBuilder()
  //   .delete()
  //   .from(User)
  //   .where("id = :id", { id: id })
  //   .execute();
  
  // }


//   async UpdateUser(id: number, attrs: Partial<User>) {
//     // check if user exist
//     const connectionDB = await ConnectionDB()
//     // const connectionDB = await connectionUser()

//    const user =await this.findUserbyID(id)
//    for (var key of Object.keys(attrs)) {
//     if(!(Object.keys(user).includes(key)))
//   throw new BadRequestException('Please check property of object');
// }

//     Object.assign(user, attrs) // copy tu attrs qua user
//    // return this.repo.save(user);
//    await connectionDB
//     .createQueryBuilder()
//     .update(User)
//     .set({ firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       password: user.password,
//      roleName: user.roleName})
//     .where("id = :id", { id })
//     .execute();
//     return user;
//   }

  // async findUserbyID(id: number){
  //   const connectionDB = await ConnectionDB()
  //   // const connectionDB = await connectionUser()

  //   const user = await connectionDB
  //   .createQueryBuilder()
  //   .select("User")
  //   .from( User, "User")
  //   .where("id = :id", {  id })
  //   .getOne();
   
  //   if(!user) {
  //     throw new NotFoundException('user is not exists')
  //   }
  //   return user
    
  // }

  // async login(userDto: loginDto): Promise<{accessToken: string,refreshToken: string}> {
   
  //  const {email,password} = userDto
  //   const user = await this.findUserByEmail(email)
  //   if(!user){
  //     throw new UnauthorizedException('login failed')
  //   }

  //   const payload:JwtPayload = {user}
  //   const accessToken = await this.jwtService.sign(payload)
  //   const refreshToken = await this.generateRefreshToken(user.id)
  //   return {
  //      accessToken,
  //     refreshToken
  //     }
  // }

  // async findUserByEmail(email: string){
  //   const connectionDB = await ConnectionDB()
  //   // const connectionDB = await connectionUser()

  //   const user = await connectionDB
  //   .createQueryBuilder() 
  //   .select("User")
  //   .from( User, "User")
  //   .where("email = :email", { email }).getOne();
  //   if( user) {
  //   //  console.log(true)
  //      return  user
  //     } 
  //   else
  //   {
  //   //  console.log(false)
  //      return false
  //     }
  // }

  // async forgotPassword(payload: ForgotPasswordDto): Promise<any> {
  // }

  // callApiToAcceptNewPasswordInEmail(Email: any) {
  //   throw new Error('Method not implemented.');
  // }
  // async generateRefreshToken(id:number):  Promise<string>{
  //   var refreshToken = suid(16);
  //   var expireddate =new Date();
  //   expireddate.setDate(expireddate.getDate() + 6);
  //   this.saveOrUpdateRefreshToken(refreshToken, id, expireddate.toString());
  //   return refreshToken
  // }

  // async saveOrUpdateRefreshToken(
  //   refreshTK:string,
  //   id:number, 
  //   refreshtokenexpires: string){
  //     const connectionDB = await ConnectionDB()

  //     await connectionDB
  //     .createQueryBuilder()
  //     .update(User)
  //     .set({ 
  //       refreshtokenexpires: refreshtokenexpires,
  //       refreshtoken: refreshTK
  //     })
      
  //     .where("id = :id", { id })
  //     .execute();
     
  //   }




    // async resetPassword(id: number, payload: resetPasswordDto): Promise<any> {
    //   try {
    //     const {  oldPassword,newPassword } = payload;
        
    //     const user = await this.findUserbyID(id)
    //    if(oldPassword != user.password)
    //    {
    //      return new ForbiddenException('old password was wrong')
    //    }

    //    if(oldPassword== newPassword)
    //    {
    //     return new ForbiddenException('new password cannot same as old password ')
    //   }

    //   this.generateRefreshToken(id);
  
    //     return { message: 'Your password has been reset' };
    //   } catch (error) {
    //     throw error;
    //   }
    // }
    
   }
   

  

  

  

   

