import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../../shared/current-user.decoration';
import { OfferService } from './offer.service';
import { CreateOfferDTO } from './dto/create-offer.dto';
import { User } from '../../generated/prisma/client';

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
}
