import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../../shared/current-user.decoration';
import { ProductService } from './product.service';
import { CreateProductDTO } from './dto/create-product.dto';

@Controller('product')
export class ProductController {

    constructor(private readonly productService: ProductService) { }
    
    @Get('all')
    findAll(@CurrentUser('tenantId') tenantId: number) {
        return this.productService.findAll(tenantId);
    }

    @Post('create')
    create(@Body() createProductDto: CreateProductDTO, @CurrentUser('tenantId') tenantId: number) {
        return this.productService.create(createProductDto, tenantId);
    }
}
