import { Module } from '@nestjs/common';
import { PaymentController } from './adapter/input/payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './application/payment.service';
import { PaymentEntity } from './adapter/output/typeorm/entity/payment.entity';
import { TypeormAdapter } from './adapter/output/typeorm/typeorm.adapter';
import { GrpcAdapter } from './adapter/output/grpc/grpc.adapter';
import { PortOneAdapter } from './adapter/output/portone/portone.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'DatabaseOutputPort',
      useClass: TypeormAdapter,
    },
    {
      provide: 'NetworkOutputPort',
      useClass: GrpcAdapter,
    },
    {
      provide: 'PaymentOutputPort',
      useClass: PortOneAdapter,
    },
  ],
})
export class PaymentModule {}
