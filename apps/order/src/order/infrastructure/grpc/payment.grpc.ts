import { PAYMENT_SERVICE, PaymentMicroservice } from '@app/common';
import { OrderEntity } from '../../domain/order.entity';
import { PaymentDto } from '../../dto/payment.dto';
import { PaymentOutputPort } from '../../port/output/payment.output-port';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export class PaymentGrpc implements PaymentOutputPort, OnModuleInit {
  paymentService: PaymentMicroservice.PaymentServiceClient;

  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly paymentMicroservice: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentService =
      this.paymentMicroservice.getService<PaymentMicroservice.PaymentServiceClient>(
        'PaymentService',
      );
  }

  async processPayment(
    order: OrderEntity,
    payment: PaymentDto,
  ): Promise<OrderEntity> {
    throw new Error('Method not implemented.');
    // const resp = await lastValueFrom(
    //   this.paymentService.makePayment({

    //   })
    // )
  }
}
