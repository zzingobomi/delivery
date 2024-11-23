import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentStatus {
  pending = 'Pending',
  rejected = 'Rejected',
  approved = 'Approved',
}

export enum PaymentMethod {
  creditCard = 'CreditCard',
  kakao = 'Kakao',
}

export enum NotificationStatus {
  pending = 'Pending',
  sent = 'Sent',
}

// 실제로는 아임포트나 카카오페이 등의 결제 모듈을 사용하게 됩니다.
// 카드정보는 PG사에 전달되고 billing key를 받아서 처리해야 합니다.
// 실제 카드정보를 저장하면 개인정보 처리방침이 달라집니다.
@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    enum: PaymentStatus,
    default: PaymentStatus.pending,
  })
  paymentStatus: PaymentStatus;

  @Column({
    enum: PaymentMethod,
    default: PaymentMethod.creditCard,
  })
  paymentMethod: PaymentMethod;

  @Column()
  cardNumber: string;

  @Column()
  expiryYear: string;

  @Column()
  expiryMonth: string;

  @Column()
  birthOrRegistration: string;

  @Column()
  passwordTwoDigit: string;

  @Column({
    enum: NotificationStatus,
    default: NotificationStatus.pending,
  })
  notificationStatus: NotificationStatus;
}
