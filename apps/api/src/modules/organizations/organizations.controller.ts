import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, OrganizationType } from '@prisma/client';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'List all organizations' })
  findAll(@Query('type') type?: OrganizationType) {
    return this.organizationsService.findAll(type);
  }

  @Get('distributors')
  @ApiOperation({ summary: 'List all distributors' })
  getDistributors() {
    return this.organizationsService.getDistributors();
  }

  @Get('stores')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS, UserRole.DISTRIBUTOR)
  @ApiOperation({ summary: 'List all stores' })
  getStores() {
    return this.organizationsService.getStores();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get organization by ID' })
  findById(@Param('id') id: string) {
    return this.organizationsService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new organization' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update organization' })
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate organization' })
  deactivate(@Param('id') id: string) {
    return this.organizationsService.deactivate(id);
  }
}
