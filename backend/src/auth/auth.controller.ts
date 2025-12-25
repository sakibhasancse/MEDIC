import { Controller, Post, Body, Get, Put, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { DoctorRegisterDto } from './dto/doctor-register.dto';
import { DoctorLoginDto } from './dto/doctor-login.dto';
import { PatientRegisterDto } from './dto/patient-register.dto';
import { PatientLoginDto } from './dto/patient-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  async register(@Body() body: DoctorRegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: DoctorLoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('patient/register')
  async patientRegister(@Body() body: PatientRegisterDto) {
    return this.authService.patientRegister(body);
  }

  @Post('patient/login')
  async patientLogin(@Body() body: PatientLoginDto) {
    return this.authService.patientLogin(body.phone, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() body: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.userId, body);
  }
}
