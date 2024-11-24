import { Inject, Injectable } from '@nestjs/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationStatus } from './entity/notification.entity';
import { ORDER_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @Inject(ORDER_SERVICE)
    private readonly oderService: ClientProxy,
  ) {}

  async sendPaymentNotification(data: SendPaymentNotificationDto) {
    const notification = await this.createNotification(data.to);

    await this.sendEmail();

    await this.updateNotificationStatus(
      notification._id.toString(),
      NotificationStatus.sent,
    );

    /// Cold Observable vs Hot Observable
    this.sendDeliveryStartedMessage(data.orderId);

    return this.notificationModel.findById(notification._id);
  }

  private sendDeliveryStartedMessage(id: string) {
    this.oderService.emit({ cmd: 'delivery_started' }, { id });
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
