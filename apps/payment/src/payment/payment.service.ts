import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entity/payment.entity';
import { Repository } from 'typeorm';
import { MakePaymentDto } from './dto/make-payment.dto';
import {
  constructMetadata,
  NOTIFICATION_SERVICE,
  NotificationMicroservice,
} from '@app/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class PaymentService implements OnModuleInit {
  notificationService: NotificationMicroservice.NotificationServiceClient;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationMicroservice: ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationService =
      this.notificationMicroservice.getService<NotificationMicroservice.NotificationServiceClient>(
        'NotificationService',
      );
  }

  async makePayment(payload: MakePaymentDto, metadata: Metadata) {
    let paymentId;

    try {
      const result = await this.paymentRepository.save(payload);
      paymentId = result.id;

      await this.processPayment();

      await this.updatePaymentStatus(paymentId, PaymentStatus.approved);

      this.sendNotification(payload.orderId, payload.userEmail, metadata);

      return this.paymentRepository.findOneBy({ id: paymentId });
    } catch (error) {
      if (paymentId) {
        await this.updatePaymentStatus(paymentId, PaymentStatus.rejected);
      }

      throw error;
    }
  }

  async processPayment() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    await this.paymentRepository.update(id, { paymentStatus: status });
  }

  async sendNotification(orderId: string, to: string, metadata: Metadata) {
    const resp = await lastValueFrom(
      this.notificationService.sendPaymentNotification(
        { to, orderId },
        constructMetadata(PaymentService.name, 'sendNotification', metadata),
      ),
    );
  }
}
