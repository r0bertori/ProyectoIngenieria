import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-001' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: '8412345678901' })
  @IsString()
  @IsOptional()
  ean?: string;

  @ApiProperty({ example: 'Crema Hidratante Facial' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Crema hidratante para todo tipo de pieles' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'L\'Oreal' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Cuidado Facial' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Hidratantes' })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'UND', default: 'UND' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  minOrderQty?: number;

  @ApiProperty()
  @IsString()
  distributorId: string;
}
