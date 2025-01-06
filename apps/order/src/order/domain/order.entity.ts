import { CustomerEntity } from './customer.entity';
import { DeliveryAddressEntity } from './delivery-address.entity';
import { PaymentEntity } from './payment.entity';
import { ProductEntity } from './product.entity';

export enum OrderStatus {
  pending = 'Pending',
  paymentCancelled = 'PaymentCancelled',
  paymentFailed = 'PaymentFailed',
  paymentProcessed = 'PaymentProcessed',
  deliveryStarted = 'DeliveryStarted',
  deleveryDone = 'DeliveryDone',
}

export class OrderEntity {
  id: string;
  customer: CustomerEntity;
  products: ProductEntity[];
  deliveryAddress: DeliveryAddressEntity;
  status: OrderStatus;
  payment: PaymentEntity;
  totalAmount: number;

  constructor(param: {
    customer: CustomerEntity;
    products: ProductEntity[];
    deliveryAddress: DeliveryAddressEntity;
  }) {
    this.customer = param.customer;
    this.products = param.products;
    this.deliveryAddress = param.deliveryAddress;
  }

  setId(id: string) {
    this.id = id;
  }

  setPayment(payment: PaymentEntity) {
    if (!this.id) {
      throw new Error('ID가 없는 주문에는 결제를 세팅할 수 없습니다.');
    }

    this.payment = payment;
  }

  calculateTotalAmount() {
    if (this.products.length === 0) {
      throw new Error('주문에는 상품이 하나 이상 필요합니다.');
    }

    const total = this.products.reduce((acc, n) => acc + n.price, 0);

    if (total <= 0) {
      throw new Error('결제 총액은 0원보다 커야 합니다.');
    }

    this.totalAmount = total;
  }

  processPayment() {
    if (!this.id) {
      throw new Error('결제를 진행하기 위해선 주문 ID가 필수입니다.');
    }

    if (this.products.length === 0) {
      throw new Error('결제를 진행하기 위해선 상품이 한개 이상 필요합니다.');
    }

    if (!this.deliveryAddress) {
      throw new Error('결제를 진행하기 위해선 배송지 정보가 필요합니다.');
    }

    if (!this.totalAmount) {
      throw new Error('결제를 진행하기 위해선 결제 총액이 필수입니다.');
    }

    if (this.status !== OrderStatus.pending) {
      throw new Error(
        'OrderStatus.pending 상태에서만 결제를 진행할 수 있습니다.',
      );
    }

    this.status = OrderStatus.paymentProcessed;
  }

  cancelOrder() {
    this.status = OrderStatus.paymentCancelled;
  }

  startDelivery() {
    if (this.status !== OrderStatus.paymentProcessed) {
      throw new Error(
        'OrderStatus.paymentProcessed 상태에서만 배송을 시작할 수 있습니다.',
      );
    }

    this.status = OrderStatus.deliveryStarted;
  }

  finishDelivery() {
    if (this.status !== OrderStatus.deliveryStarted) {
      throw new Error(
        'OrderStatus.deliveryStarted 상태에서만 배송을 완료할 수 있습니다.',
      );
    }

    this.status = OrderStatus.deleveryDone;
  }
}
