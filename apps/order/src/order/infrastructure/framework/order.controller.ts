import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from '../../order.service';
import { CreateOrderDto } from '../../dto/create-order.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  GrpcInterceptor,
  OrderMicroservice,
  RpcInterceptor,
} from '@app/common';
import { DeliveryStartedDto } from '../../dto/delivery-started.dto';
import { Order, OrderStatus } from '../../entity/order.entity';
import { PaymentMethod } from '../../entity/payment.entity';
import { Metadata } from '@grpc/grpc-js';
import { CreateOrderUseCase } from '../../usecase/create-order.usecase';
import { StartDeliveryUseCase } from '../../usecase/start-delivery.usecase';
import { CreateOrderRequestMapper } from './mapper/create-order-request.mapper';

@Controller('order')
@OrderMicroservice.OrderServiceControllerMethods()
@UseInterceptors(GrpcInterceptor)
export class OrderController
  implements OrderMicroservice.OrderServiceController
{
  constructor(
    private readonly createOrderUsecase: CreateOrderUseCase,
    private readonly startDeliveryUsecase: StartDeliveryUseCase,
  ) {}

  async deliveryStarted(request: OrderMicroservice.DeliveryStartedRequest) {
    await this.startDeliveryUsecase.execute(request.id);
  }

  async createOrder(
    request: OrderMicroservice.CreateOrderRequest,
    metadata: Metadata,
  ) {
    return this.createOrderUsecase.execute(
      new CreateOrderRequestMapper(request).toDomain(),
    );
  }
}
