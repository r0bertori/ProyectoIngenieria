import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  getDashboard(@CurrentUser() user: CurrentUserData) {
    return this.reportingService.getDashboard(
      user.role as UserRole,
      user.organizationId,
    );
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get order metrics' })
  getOrderMetrics(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.reportingService.getOrderMetrics(fromDate, toDate);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Get incident metrics' })
  getIncidentMetrics() {
    return this.reportingService.getIncidentMetrics();
  }
}
