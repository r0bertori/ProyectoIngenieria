import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IncidentStatus, IncidentType } from '@prisma/client';

export class IncidentQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: IncidentStatus })
  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @ApiPropertyOptional({ enum: IncidentType })
  @IsEnum(IncidentType)
  @IsOptional()
  type?: IncidentType;
}
