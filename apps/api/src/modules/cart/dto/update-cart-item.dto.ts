import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;
}
