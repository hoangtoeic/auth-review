import { Body, Controller, Delete, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, updateUserDto } from './dto';

@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService){}

  @Post('/register')
  register(@Body(ValidationPipe) payload: RegisterDto) {
    return this.authService.register(payload)
  }

  @Delete('/:id') 
  deleteUser(@Param('id') id: number) {
    return this.authService.deleteUser(id)
  }

  @Patch('/:id')
  updateUser(@Param('id') id: number, @Body(ValidationPipe) updateUserDto: updateUserDto){
   return this.authService.UpdateUser(id, updateUserDto)
  }

 
}
