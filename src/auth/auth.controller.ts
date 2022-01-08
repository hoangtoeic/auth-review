import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from './decorator/roles.decorator';
import { createRoleDto, ForgotPasswordDto, loginDto, RefreshTokenDto, RegisterDto, ResetPasswordDto, resetPasswordDto, updateUserDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService){}

  @Post('/register')
  register(@Body(ValidationPipe) payload: RegisterDto): Promise<any> {
    return this.authService.register(payload)
  }

  @Post('/refreshToken')
  refreshToken(@Body() payload: RefreshTokenDto): Promise<any> {
    return this.authService.refreshToken(payload)
  }

  @Post('/resetPassword')
  resetPassword(@Body() payload: ResetPasswordDto): Promise<any> {
    return this.authService.resetPassword(payload);
  }

  
  @Post('/forgotPassword')
  forgotPassword(@Body() payload: ForgotPasswordDto): Promise<any> {
    return this.authService.forgotPassword(payload);
  }

  // @Delete('/:id') 
  // deleteUser(@Param('id') id: number) {
  //   return this.authService.deleteUser(id)
  // }

  // @UseGuards(JwtAuthGuard)
  // @Roles('ADMIN','USER','SUPERADMIN')
  // @Patch('/:id')
  // updateUser(@Param('id') id: number, @Body(ValidationPipe) updateUserDto: updateUserDto){
  //  return this.authService.UpdateUser(id, updateUserDto)
  // }

  @Post('login')
  async login(@Body(ValidationPipe) loginDto:loginDto): Promise<any> {
    return this.authService.login(loginDto);
  }

  // @Post('testAdmin/:id')
  // @UseGuards(JwtAuthGuard)
  // @Roles('ADMIN','SUPERADMIN')
  //   async findUser(@Param('id') id: number) {
  //    return this.authService.findUserbyID(id)
  //   }

  // @UseGuards(JwtAuthGuard)
  // @Roles('ADMIN','USER','SUPERADMIN')
  // @Patch('resetpassword/:id')
  //   resetPassword(@Param('id') id: number, @Body(ValidationPipe) resetPassword: resetPasswordDto){
  //    return this.authService.resetPassword(id, resetPassword)
  //   }

  // @UseGuards(JwtAuthGuard)
  // @Roles('ADMIN','USER','SUPERADMIN')
  // @Patch('forgotpassword/:id')
  //   forgotPassword( forgotPassword: ForgotPasswordDto){
  //    return this.authService.forgotPassword(forgotPassword)
  //   }

 
}
