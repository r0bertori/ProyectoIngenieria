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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders with filters' })
  findAll(
    @Query() query: OrderQueryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.ordersService.findAll(
      query,
      user.id,
      user.role as UserRole,
      user.organizationId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.ordersService.findById(
      id,
      user.id,
      user.role as UserRole,
      user.organizationId,
    );
  }

  @Post()
  @Roles(UserRole.STORE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create order from cart' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createFromCart(
      user.id,
      user.organizationId,
      createOrderDto,
    );
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS, UserRole.DISTRIBUTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update order status' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, user.id, updateStatusDto);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get order status history' })
  getStatusHistory(@Param('id') id: string) {
    return this.ordersService.getStatusHistory(id);
  }
}
