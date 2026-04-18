import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { IncidentType } from '@prisma/client';

export class CreateIncidentDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty({ enum: IncidentType })
  @IsEnum(IncidentType)
  type: IncidentType;

  @ApiProperty()
  @IsString()
  description: string;
}
