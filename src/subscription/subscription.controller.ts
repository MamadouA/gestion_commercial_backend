import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDTO } from './dto/create-subscription.dto';
import { CurrentUser } from '../shared/current-user.decoration';
import { Role } from '../generated/prisma/client';
import { SubscriptionQueryDTO } from './dto/subscription-query.dto';

@Controller('subscription')
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    // -
    @Get('all')
    async findAll(@Query() query: SubscriptionQueryDTO) {
        return await this.subscriptionService.findAll(query);
    }

    //  -
    @Post('create')
    async create(@Body()createSubscriptionDTO: CreateSubscriptionDTO, @CurrentUser('role') role: Role) {
        return await this.subscriptionService.create(createSubscriptionDTO, role);
    }
}
