import { PaymentModel } from '../../../domain/payment.domain';
import { PaymentOutputPort } from '../../../port/output/payment.output-port';

export class PortOneAdapter implements PaymentOutputPort {
  async processPayment(payment: PaymentModel): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  }
}
