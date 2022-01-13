import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsIn,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ROLE } from 'src/db/entities/user.entity';

const passwordRegex = new RegExp('(?=.*[A-Za-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')
const passwordMessage = 'Password must have at least 8 character, including number, letter and special characters'
export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Matches(passwordRegex, {
    message: passwordMessage
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([ROLE.ADMIN, ROLE.SUPERADMIN, ROLE.USER])
  roleName: ROLE;
}

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  firstName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  lastName?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Matches(passwordRegex, {
    message: passwordMessage
  })
  password?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsIn([ROLE.ADMIN, ROLE.SUPERADMIN, ROLE.USER])
  roleName?: ROLE;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Matches(passwordRegex, {
    message: passwordMessage
  } )
  password: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}


export class createRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  @Matches(passwordRegex, {
    message: passwordMessage
  })
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  resetPasswordToken: string;
}
