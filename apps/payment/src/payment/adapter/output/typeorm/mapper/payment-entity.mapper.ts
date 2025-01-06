import { PaymentModel } from 'apps/payment/src/payment/domain/payment.domain';
import { PaymentEntity } from '../entity/payment.entity';

export class PaymentEntityMapper {
  constructor(private readonly payment: PaymentEntity) {}

  toDomain() {
    const payment = new PaymentModel({
      paymentMethod: this.payment.paymentMethod,
      cardNumber: this.payment.cardNumber,
      expiryYear: this.payment.expiryYear,
      expiryMonth: this.payment.expiryMonth,
      birthOrRegistration: this.payment.birthOrRegistration,
      passwordTwoDigit: this.payment.passwordTwoDigit,
      amount: this.payment.amount,
      userEmail: this.payment.userEmail,
      orderId: this.payment.orderId,
    });

    payment.assignId(this.payment.id);

    return payment;
  }
}
