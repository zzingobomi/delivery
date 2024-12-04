import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';

import { MessagePattern, Payload } from '@nestjs/microservices';
import { ParseBearerTokenDto } from './dto/parse-bearer-token.dto';
import { GrpcInterceptor, RpcInterceptor } from '@app/common';
import { LoginDto } from './dto/login.dto';
import { UserMicroservice } from '@app/common';
import { Metadata } from '@grpc/grpc-js';

@Controller('auth')
@UserMicroservice.AuthServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class AuthController implements UserMicroservice.AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  parseBearerToken(request: UserMicroservice.ParseBearerTokenRequest) {
    return this.authService.parseBearerToken(request.token, false);
  }

  registerUser(request: UserMicroservice.RegisterUserRequest) {
    const { token } = request;

    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요!');
    }

    return this.authService.register(token, request);
  }

  loginUser(loginDto: UserMicroservice.LoginUserRequest, metadata: Metadata) {
    const { token } = loginDto;

    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요!');
    }

    return this.authService.login(token);
  }
}
