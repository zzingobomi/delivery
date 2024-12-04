import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationStatus } from './entity/notification.entity';
import {
  constructMetadata,
  ORDER_SERVICE,
  OrderMicroservice,
} from '@app/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class NotificationService implements OnModuleInit {
  orderService: OrderMicroservice.OrderServiceClient;

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @Inject(ORDER_SERVICE)
    private readonly oderMicroservice: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService =
      this.oderMicroservice.getService<OrderMicroservice.OrderServiceClient>(
        'OrderService',
      );
  }

  async sendPaymentNotification(
    data: SendPaymentNotificationDto,
    metadata: Metadata,
  ) {
    const notification = await this.createNotification(data.to);

    await this.sendEmail();

    await this.updateNotificationStatus(
      notification._id.toString(),
      NotificationStatus.sent,
    );

    /// Cold Observable vs Hot Observable
    this.sendDeliveryStartedMessage(data.orderId, metadata);

    return this.notificationModel.findById(notification._id);
  }

  private sendDeliveryStartedMessage(id: string, metadata: Metadata) {
    this.orderService.deliveryStarted(
      { id },
      constructMetadata(
        NotificationService.name,
        'sendDeliveryStartedMessage',
        metadata,
      ),
    );
  }

  private async updateNotificationStatus(
    id: string,
    status: NotificationStatus,
  ) {
    return this.notificationModel.findByIdAndUpdate(id, { status });
  }

  private async sendEmail() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async createNotification(to: string) {
    return this.notificationModel.create({
      from: 'zzingo5@gmail.com',
      to,
      subject: '배송이 시작되었습니다!',
      content: `${to}님! 주문하신 상품이 배송 시작되었습니다!`,
    });
  }
}
