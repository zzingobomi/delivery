import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  PAYMENT_SERVICE,
  PaymentMicroservice,
  PRODUCT_SERVICE,
  ProductMicroservice,
  USER_SERVICE,
  UserMicroservice,
} from '@app/common';
import { PaymentCancelledException } from './exception/payment-cancelled.exception';
import { Product } from './entity/product.entity';
import { Customer } from './entity/customer.entity';
import { AddressDto } from './dto/address.dto';
import { PaymentDto } from './dto/payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderStatus } from './entity/order.entity';
import { Model } from 'mongoose';
import { PaymentFailedException } from './exception/payment-failed.exception';

@Injectable()
export class OrderService implements OnModuleInit {
  userService: UserMicroservice.UserServiceClient;
  productService: ProductMicroservice.ProductServiceClient;
  paymentService: PaymentMicroservice.PaymentServiceClient;

  constructor(
    @Inject(USER_SERVICE)
    private readonly userMicroservice: ClientGrpc,
    @Inject(PRODUCT_SERVICE)
    private readonly productMicroservice: ClientGrpc,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentMicroservice: ClientGrpc,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  onModuleInit() {
    this.userService =
      this.userMicroservice.getService<UserMicroservice.UserServiceClient>(
        'UserService',
      );
    this.productService =
      this.productMicroservice.getService<ProductMicroservice.ProductServiceClient>(
        'ProductService',
      );
    this.paymentService =
      this.paymentMicroservice.getService<PaymentMicroservice.PaymentServiceClient>(
        'PaymentService',
      );
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const { productIds, address, payment, meta } = createOrderDto;
    // 1. 사용자 정보 가져오기
    const user = await this.getUserFromToken(meta.user.sub);

    // 2. 상품 정보 가져오기
    const products = await this.getProductsByIds(productIds);

    // 3. 총 금액 계산하기
    const totalAmount = this.calculateTotalAmount(products);

    // 4. 금액 검증하기 - total이 맞는지 (프론트에서 보내준 데이터랑)
    this.validatePaymentAmount(totalAmount, payment.amount);

    // 5. 주문 생성하기
    const customer = this.createCustomer(user);
    const order = await this.createNewOrder(
      customer,
      products,
      address,
      payment,
    );

    // 6. 결제 시도하기
    await this.processPayment(order._id.toString(), payment, user.email);

    // 7. 결과 반환하기
    return this.orderModel.findById(order._id);
  }

  private async getUserFromToken(userId: string) {
    // 1. User MS : jwt 토큰 검증하기
    // const tResp = await lastValueFrom(
    //   this.userService.send({ cmd: 'parse_bearer_token' }, { token }),
    // );

    // if (tResp.status === 'error') {
    //   throw new PaymentCancelledException(tResp);
    // }

    // 2. User MS : 사용자 정보 가져오기
    // const userId = tResp.data.sub;
    const uResp = await lastValueFrom(this.userService.getUserInfo({ userId }));
    return uResp;
  }

  private async getProductsByIds(productIds: string[]): Promise<Product[]> {
    const resp = await lastValueFrom(
      this.productService.getProductsInfo({ productIds }),
    );

    return resp.products.map((product) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
    }));
  }

  private calculateTotalAmount(products: Product[]) {
    return products.reduce((acc, product) => acc + product.price, 0);
  }

  private validatePaymentAmount(totalA: number, totalB: number) {
    if (totalA !== totalB) {
      throw new PaymentCancelledException('결제하려는 금액이 변경되었습니다.');
    }
  }

  private createCustomer(user: {
    id: string;
    email: string;
    name: string;
  }): Customer {
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }

  private createNewOrder(
    customer: Customer,
    products: Product[],
    deliveryAddress: AddressDto,
    payment: PaymentDto,
  ) {
    return this.orderModel.create({
      customer,
      products,
      deliveryAddress,
      payment,
    });
  }

  private async processPayment(
    orderId: string,
    payment: PaymentDto,
    userEmail: string,
  ) {
    try {
      const resp = await lastValueFrom(
        this.paymentService.makePayment({ ...payment, userEmail, orderId }),
      );

      const isPaid = resp.paymentStatus === 'Approved';
      const orderStatus = isPaid
        ? OrderStatus.paymentProcessed
        : OrderStatus.paymentFailed;

      if (orderStatus === OrderStatus.paymentFailed) {
        throw new PaymentFailedException(resp);
      }

      await this.orderModel.findByIdAndUpdate(orderId, {
        status: OrderStatus.paymentProcessed,
      });

      return resp;
    } catch (error) {
      if (error instanceof PaymentFailedException) {
        await this.orderModel.findByIdAndUpdate(orderId, {
          status: OrderStatus.paymentFailed,
        });
      }

      throw error;
    }
  }

  async changeOrderStatus(orderId: string, status: OrderStatus) {
    return this.orderModel.findByIdAndUpdate(orderId, { status });
  }
}
