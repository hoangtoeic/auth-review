import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ForgotPasswordDto, loginDto, RegisterDto, resetPasswordDto, updateUserDto } from './dto';
import {getConnection} from "typeorm"; 
import { User } from 'src/db/entities/user.entity';
import { ConnectionDB } from 'src/connectionDB/connectionDB';
import {ConnectionManager, Repository,Connection,EntityManager} from 'typeorm'
import { InjectRepository,InjectConnection, InjectEntityManager } from '@nestjs/typeorm';
import { use } from 'passport';
import { targetModulesByContainer } from '@nestjs/core/router/router-module';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { suid } from 'rand-token';


@Injectable()
export class AuthService {
 
  constructor( private jwtService: JwtService)
  {}
  async register( payload: RegisterDto) {
    const {email, firstName, lastName, password, roleName} = payload

    const  connectionDB = await ConnectionDB()
    const checkExistedUser =await this.findUserByEmail(email)
    
    if( checkExistedUser) throw new ForbiddenException('user existed, please change your email')
   
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
    return payload

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
    .update(User)
    .set({ firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
     roleName: user.roleName})
    .where("id = :id", { id })
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

  async login(userDto: loginDto): Promise<{accessToken: string,refreshToken: string}> {
   
   const {email,password} = userDto
    const user = await this.findUserByEmail(email)
    if(!user){
      throw new UnauthorizedException('login failed')
    }

    const payload:JwtPayload = {user}
    const accessToken = await this.jwtService.sign(payload)
    const refreshToken = await this.generateRefreshToken(user.id)
    return {
       accessToken,
      refreshToken
      }
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
       return  user
      } 
    else
    {
    //  console.log(false)
       return false
      }
  }

  async forgotPassword(payload: ForgotPasswordDto): Promise<any> {

    const {email} = payload;
    this.generateRefreshToken
    return this.callApiToAcceptNewPasswordInEmail(email)

  
    //     await getManager()
    //       .createQueryBuilder(Entities.User, 'User')
    //       .update()
    //       .set({
    //         resetPasswordToken,
    //         resetPasswordTokenExpired
    //       })
    //       .where('id = :id', { id: user.id })
    //       .execute();
   

    //     const linkResetPassword = `${
    //       isAdmin ? config.api.adminWebsite : config.api.clientWebsite
    //     }/reset-password?token=${resetPasswordToken}`;


    //     this.emailFunctions.sendEmailResetPassword(
    //       user.email,
    //       linkResetPassword
    //     );
    //   }
    //   return { message: 'Your reset password request has been confirmed' };
    // } catch (error) {
    //   throw error;
    // }
  }
  callApiToAcceptNewPasswordInEmail(Email: any) {
    throw new Error('Method not implemented.');
  }
  async generateRefreshToken(id:number):  Promise<string>{
    var refreshToken = suid(16);
    var expireddate =new Date();
    expireddate.setDate(expireddate.getDate() + 6);
    this.saveOrUpdateRefreshToken(refreshToken, id, expireddate.toString());
    return refreshToken
  }

  async saveOrUpdateRefreshToken(
    refreshTK:string,
    id:number, 
    refreshtokenexpires: string){
      const connectionDB = await ConnectionDB()

      await connectionDB
      .createQueryBuilder()
      .update(User)
      .set({ 
        refreshtokenexpires: refreshtokenexpires,
        refreshtoken: refreshTK
      })
      
      .where("id = :id", { id })
      .execute();
     
    }

    async resetPassword(id: number, payload: resetPasswordDto): Promise<any> {
      try {
        const {  oldPassword,newPassword } = payload;
        
        const user = await this.findUserbyID(id)
       if(oldPassword != user.password)
       {
         return new ForbiddenException('old password was wrong')
       }

       if(oldPassword== newPassword)
       {
        return new ForbiddenException('new password cannot same as old password ')
      }

      this.generateRefreshToken(id);
  
        return { message: 'Your password has been reset' };
      } catch (error) {
        throw error;
      }
    }
    
   }
   

  

  

  

   

