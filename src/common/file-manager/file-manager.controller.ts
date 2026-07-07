import { Controller, Delete, Get, Param, ParseIntPipe } from '@nestjs/common';
import { S3ClientService } from './s3-client.service';
import { PrismaClientService } from '../../database/prisma-client.service';
import { CurrentUser } from '../../shared/current-user.decoration';

@Controller('file')
export class FileManagerController {
    constructor (private readonly s3ClientService: S3ClientService, private readonly prismaClientService: PrismaClientService) {}

    @Delete(':id/remove')
    async removeS3File(@Param('id', ParseIntPipe) id: number, @CurrentUser('tenantId') tenantId: number) {
        return await this.s3ClientService.deleteById(id);
    }

    @Get(':id')
    async getS3DownloadUrl(@Param('id', ParseIntPipe) id: number) {
        return await this.s3ClientService.generateDownloadUrl(id);
    }
}
