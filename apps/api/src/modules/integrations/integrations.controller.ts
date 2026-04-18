import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OPERATIONS)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('catalog/import')
  @ApiOperation({ summary: 'Import catalog from CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importCatalog(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentUserData,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const content = file.buffer.toString('utf-8');
    return this.integrationsService.importCatalog(content, user.organizationId);
  }

  @Post('stock/import')
  @ApiOperation({ summary: 'Import stock from CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importStock(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentUserData,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const content = file.buffer.toString('utf-8');
    return this.integrationsService.importStock(content, user.organizationId);
  }

  @Get('orders/export')
  @ApiOperation({ summary: 'Export orders to CSV' })
  async exportOrders(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.integrationsService.exportOrders(fromDate, toDate);

    res?.setHeader('Content-Type', 'text/csv');
    res?.setHeader('Content-Disposition', `attachment; filename=orders-${Date.now()}.csv`);
    res?.send(csv);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List integration jobs' })
  getJobs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.integrationsService.getJobs(page, limit);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get integration job by ID' })
  getJob(@Param('id') id: string) {
    return this.integrationsService.getJob(id);
  }
}
