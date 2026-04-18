import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shippingCity?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shippingPostalCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
