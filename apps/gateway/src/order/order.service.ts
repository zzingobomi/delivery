import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  ORDER_SERVICE,
  OrderMicroservice,
  UserMeta,
  UserPayloadDto,
} from '@app/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrderService implements OnModuleInit {
  orderService: OrderMicroservice.OrderServiceClient;

  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderMicroservice: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService =
      this.orderMicroservice.getService<OrderMicroservice.OrderServiceClient>(
        'OrderService',
      );
  }

  createOrder(createOrderDto: CreateOrderDto, userPayload: UserPayloadDto) {
    return lastValueFrom(
      this.orderService.createOrder({
        ...createOrderDto,
        meta: { user: userPayload },
      }),
    );
  }
}
