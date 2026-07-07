import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { S3ClientService } from './s3-client.service';
import { PrismaClientService } from '../../database/prisma-client.service';
import { CurrentUser } from '../../shared/current-user.decoration';

@Controller('file')
export class FileManagerController {
    constructor (private readonly s3ClientService: S3ClientService, private readonly prismaClientService: PrismaClientService) {}

    @Get(':id/remove')
    async removeFile(@Param('id', ParseIntPipe) id: number, @CurrentUser('tenantId') tenantId: number) {
        return await this.s3ClientService.deleteFile(id, tenantId);
    }

    @Get(':id')
    async getFileUrl(@Param('id', ParseIntPipe) id: number) {
        
    }
}
