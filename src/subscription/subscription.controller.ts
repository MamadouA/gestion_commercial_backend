import { Body, Controller, Get, Post } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDTO } from './dto/create-subscription.dto';
import { CurrentUser } from '../shared/current-user.decoration';
import { Role } from '../generated/prisma/client';

@Controller('subscription')
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    // -
    @Get('all')
    async findAll() {
        return await this.subscriptionService.findAll();
    }

    //  -
    @Post('create')
    async create(@Body()createSubscriptionDTO: CreateSubscriptionDTO, @CurrentUser('role') role: Role) {
        return await this.subscriptionService.create(createSubscriptionDTO, role);
    }
}
