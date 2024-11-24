import {
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetProductsInfoDto } from './dto/get-products-info.dto';
import { RpcInterceptor } from '@app/common';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('sample')
  async createSamples() {
    return this.productService.createSamples();
  }

  @MessagePattern({ cmd: 'get_products_info' })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  async getProductsInfo(@Payload() data: GetProductsInfoDto) {
    return this.productService.getProductsInfo(data.productIds);
  }
}
