import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrderMicroservice, RpcInterceptor } from '@app/common';
import { DeliveryStartedDto } from './dto/delivery-started.dto';
import { Order, OrderStatus } from './entity/order.entity';
import { PaymentMethod } from './entity/payment.entity';

@Controller('order')
@OrderMicroservice.OrderServiceControllerMethods()
export class OrderController
  implements OrderMicroservice.OrderServiceController
{
  constructor(private readonly orderService: OrderService) {}

  async deliveryStarted(payload: OrderMicroservice.DeliveryStartedRequest) {
    return this.orderService.changeOrderStatus(
      payload.id,
      OrderStatus.deliveryStarted,
    );
  }

  async createOrder(request: OrderMicroservice.CreateOrderRequest) {
    return this.orderService.createOrder({
      ...request,
      payment: {
        ...request.payment,
        paymentMethod: request.payment.paymentMethod as PaymentMethod,
      },
    });
  }
}
