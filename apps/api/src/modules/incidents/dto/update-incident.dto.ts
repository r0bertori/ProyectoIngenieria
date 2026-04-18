import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { IncidentStatus } from '@prisma/client';

export class UpdateIncidentDto {
  @ApiPropertyOptional({ enum: IncidentStatus })
  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  resolution?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignedToId?: string;
}
