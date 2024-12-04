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
import { ProductMicroservice, RpcInterceptor } from '@app/common';

@Controller('product')
@ProductMicroservice.ProductServiceControllerMethods()
export class ProductController
  implements ProductMicroservice.ProductServiceController
{
  constructor(private readonly productService: ProductService) {}

  async createSamples() {
    const resp = await this.productService.createSamples();

    return { success: resp };
  }

  async getProductsInfo(request: ProductMicroservice.GetProductsInfoRequest) {
    const resp = await this.productService.getProductsInfo(request.productIds);

    return { products: resp };
  }
}
