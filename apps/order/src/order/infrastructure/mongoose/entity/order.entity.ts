import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { CustomerDocument, CustomerSchema } from './customer.entity';
import { ProductDocument, ProductSchema } from './product.entity';
import {
  DeliveryAddressDocument,
  DeliveryAddressSchema,
} from './delivery-address.entity';
import { PaymentDocument, PaymentSchema } from './payment.entity';

export enum OrderStatus {
  pending = 'Pending',
  paymentCancelled = 'PaymentCancelled',
  paymentFailed = 'PaymentFailed',
  paymentProcessed = 'PaymentProcessed',
  deliveryStarted = 'DeliveryStarted',
  deleveryDone = 'DeliveryDone',
}

@Schema()
export class OrderDocument extends Document<ObjectId> {
  @Prop({
    type: CustomerSchema,
    required: true,
  })
  customer: CustomerDocument;

  @Prop({
    type: [ProductSchema],
    required: true,
  })
  products: ProductDocument[];

  @Prop({
    type: DeliveryAddressSchema,
    required: true,
  })
  deliveryAddress: DeliveryAddressDocument;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.pending,
  })
  status: OrderStatus;

  @Prop({
    type: PaymentSchema,
  })
  payment: PaymentDocument;
}

export const OrderSchema = SchemaFactory.createForClass(OrderDocument);
