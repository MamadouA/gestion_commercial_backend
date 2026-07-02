import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../shared/current-user.decoration';
import { OfferService } from './offer.service';
import { CreateOfferDTO } from './dto/create-offer.dto';
import { User } from '../../generated/prisma/client';
import { UpdateOfferDTO } from './dto/update-offer.dto';

@Controller('offer')
export class OfferController {

    constructor(private readonly offerService: OfferService) {}

    @Get('all')
    findAll(@CurrentUser('tenantId') tenantId: number) {
        return this.offerService.findAll(tenantId);
    }

    @Post('create')
    create(@Body() createOfferDto: CreateOfferDTO, @CurrentUser() user: User) {
        return this.offerService.create(createOfferDto, user.id, user.tenantId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('tenantId') tenantId: number) {
        return this.offerService.findOne(id, tenantId);
    }

    @Patch(':id/update')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateOfferDto: UpdateOfferDTO, @CurrentUser('id') userId: number, @CurrentUser('tenantId') tenantId: number) {
        return this.offerService.update(id, updateOfferDto, userId, tenantId);
    }
}
