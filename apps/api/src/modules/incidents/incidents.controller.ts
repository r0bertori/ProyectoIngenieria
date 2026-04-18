import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentQueryDto } from './dto/incident-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('incidents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'List incidents' })
  findAll(
    @Query() query: IncidentQueryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.incidentsService.findAll(
      query,
      user.role as UserRole,
      user.organizationId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by ID' })
  findById(@Param('id') id: string) {
    return this.incidentsService.findById(id);
  }

  @Post()
  @Roles(UserRole.STORE, UserRole.OPERATIONS)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create incident' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createIncidentDto: CreateIncidentDto,
  ) {
    return this.incidentsService.create(user.id, createIncidentDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update incident' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateIncidentDto: UpdateIncidentDto,
  ) {
    return this.incidentsService.update(id, user.id, updateIncidentDto);
  }
}
