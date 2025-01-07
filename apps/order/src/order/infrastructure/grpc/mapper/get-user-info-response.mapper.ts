import { UserMicroservice } from '@app/common';
import { CustomerEntity } from '../../../domain/customer.entity';

export class GetUserInfoResponseMapper {
  constructor(
    private readonly response: UserMicroservice.GetUserInfoResponse,
  ) {}

  toDomain() {
    return new CustomerEntity({
      userId: this.response.id,
      name: this.response.name,
      email: this.response.email,
    });
  }
}
