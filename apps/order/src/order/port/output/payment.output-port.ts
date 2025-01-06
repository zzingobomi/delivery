import { OrderEntity } from '../../domain/order.entity';
import { PaymentDto } from '../../dto/payment.dto';

export interface PaymentOutputPort {
  processPayment(order: OrderEntity, payment: PaymentDto): Promise<OrderEntity>;
}
