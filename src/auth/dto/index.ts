import {IsString, IsEmail, IsNotEmpty, IsIn, MaxLength, Matches, IsOptional} from 'class-validator';
import { ROLE } from 'src/db/entities/user.entity';



export class RegisterDto{
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  firstName: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  lastName: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Matches(new RegExp(
    '(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})'
  ), {
    message:
      'Password must have at least 8 character, including number, letter and special characters'
  })
  password: string

  @IsNotEmpty()
  @IsString()
  @IsIn([ROLE.ADMIN, ROLE.SUPERADMIN, ROLE.USER])
  roleName: ROLE
}


export class updateUserDto{
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  firstName?: string

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  lastName?: string

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Matches(new RegExp(
    '(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})'
  ), {
    message:
      'Password must have at least 8 character, including number, letter and special characters'
  })
  password?: string

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsIn([ROLE.ADMIN, ROLE.SUPERADMIN, ROLE.USER])
  roleName?: ROLE
}


export class loginDto {
  @IsNotEmpty()
  @IsEmail()  
  email: string;

 

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Matches(new RegExp(
    '(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})'
  ), {
    message:
      'Password must have at least 8 character, including number, letter and special characters'
  })
  password: string

}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()  
  email: string;
}


export class resetPasswordDto {
  @IsNotEmpty()
  @IsEmail()  
  email: string;

 

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Matches(new RegExp(
    '(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})'
  ), {
    message:
      'Password must have at least 8 character, including number, letter and special characters'
  })
  oldPassword: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Matches(new RegExp(
    '(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})'
  ), {
    message:
      'Password must have at least 8 character, including number, letter and special characters'
  })
  newPassword: string

}

export class createRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}