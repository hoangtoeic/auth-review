import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from './decorator/roles.decorator';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto';
import { ForgotPasswordResponse } from './interface/forgotPasswordResponse.interface';
import { LoginResponse } from './interface/loginResponse.interface';
import { RefreshTokenResponse } from './interface/refreshTokenResponse.interface';
import { RegisterResponse } from './interface/registerResponse.interface';
import { ResetPasswordResponse } from './interface/resetPasswordResponse.interface';
import { JwtAuthGuard } from './middleware/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(
    @Body(ValidationPipe) payload: RegisterDto,
  ): Promise<RegisterResponse> {
    return this.authService.register(payload);
  }

  @Post('/refreshToken')
  refreshToken(
    @Body() payload: RefreshTokenDto,
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(payload);
  }

  @Post('/resetPassword')
  resetPassword(@Body() payload: ResetPasswordDto): Promise<ResetPasswordResponse> {
    return this.authService.resetPassword(payload);
  }

  @Post('/forgotPassword')
  forgotPassword(@Body() payload: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(payload);
  }

  @Post('login')
  async login(
    @Body(ValidationPipe) LoginDto: LoginDto,
  ): Promise<LoginResponse> {
    return this.authService.login(LoginDto);
  }

  @Post('testAuthor/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  async testAuthor(@Param('id') id: number) {
    return { message: 'testAuthor' };
  }

  @Post('testAuthen/:id')
  @UseGuards(JwtAuthGuard)
  async testAuthen(@Param('id') id: number) {
    return { message: 'testAuthen' };
  }
}
