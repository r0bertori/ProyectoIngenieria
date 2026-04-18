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
import { CatalogService } from './catalog.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List products with filters and pagination' })
  findAll(
    @Query() query: ProductQueryDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.catalogService.findAll(query, user.organizationId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all product categories' })
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Get('brands')
  @ApiOperation({ summary: 'List all product brands' })
  getBrands() {
    return this.catalogService.getBrands();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findById(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.catalogService.findById(id, user.organizationId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Create new product' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.catalogService.create(createProductDto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.catalogService.update(id, updateProductDto);
  }
}
