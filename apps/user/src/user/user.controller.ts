import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetUserInfoDto } from './dto/get-user-info.dto';
import { GrpcInterceptor, RpcInterceptor, UserMicroservice } from '@app/common';

@Controller()
@UserMicroservice.UserServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class UserController implements UserMicroservice.UserServiceController {
  constructor(private readonly userService: UserService) {}

  getUserInfo(request: UserMicroservice.GetUserInfoRequest) {
    return this.userService.getUserById(request.userId);
  }
}
