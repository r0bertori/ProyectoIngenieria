import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { OrganizationType } from '@prisma/client';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Beauty Store Madrid' })
  @IsString()
  name: string;

  @ApiProperty({ enum: OrganizationType, example: OrganizationType.STORE })
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @ApiProperty({ example: 'B12345678' })
  @IsString()
  taxId: string;

  @ApiProperty({ example: 'store@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+34 912 345 678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Calle Gran Via, 123' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Madrid' })
  @IsString()
  city: string;

  @ApiProperty({ example: '28001' })
  @IsString()
  postalCode: string;

  @ApiPropertyOptional({ example: 'ES', default: 'ES' })
  @IsString()
  @IsOptional()
  country?: string;
}
