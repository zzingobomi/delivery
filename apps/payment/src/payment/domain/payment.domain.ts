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

export class PaymentModel {
  id: string;
  orderId: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  cardNumber: string;
  expiryYear: string;
  expiryMonth: string;
  birthOrRegistration: string;
  passwordTwoDigit: string;
  notificationStatus: NotificationStatus;
  amount: number;
  userEmail: string;

  constructor(param: {
    paymentMethod: PaymentMethod;
    cardNumber: string;
    expiryYear: string;
    expiryMonth: string;
    birthOrRegistration: string;
    passwordTwoDigit: string;
    amount: number;
    userEmail: string;
    orderId: string;
  }) {
    this.paymentStatus = PaymentStatus.pending;
    this.notificationStatus = NotificationStatus.pending;

    this.paymentMethod = param.paymentMethod;
    this.cardNumber = param.cardNumber;
    this.expiryYear = param.expiryYear;
    this.expiryMonth = param.expiryMonth;
    this.birthOrRegistration = param.birthOrRegistration;
    this.passwordTwoDigit = param.passwordTwoDigit;
    this.amount = param.amount;
    this.userEmail = param.userEmail;
    this.orderId = param.orderId;
  }

  assignId(id: string) {
    this.id = id;
  }

  processPayment() {
    if (!this.id) {
      throw new Error('ID가 없는 주문을 결제 할 수 없습니다.');
    }

    this.paymentStatus = PaymentStatus.approved;
  }

  rejectPayment() {
    if (!this.id) {
      throw new Error('ID가 없는 주문을 결제 거절 할 수 없습니다.');
    }

    this.paymentStatus = PaymentStatus.rejected;
  }

  sendNotification() {
    this.notificationStatus = NotificationStatus.sent;
  }
}
