import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Beauty Store Madrid' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'store@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+34 912 345 678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Calle Gran Via, 123' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Madrid' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: '28001' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
