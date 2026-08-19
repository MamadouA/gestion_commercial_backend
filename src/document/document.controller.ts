import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDTO } from './dto/create-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILE_FILTER } from '../common/common.constants';
import { CurrentUser } from '../shared/current-user.decoration';

@Controller('document')
export class DocumentController {
    constructor(private documentService: DocumentService) {}

    @Post('create')
    @UseInterceptors(FileInterceptor('file', FILE_FILTER))
    async create(@Body() createDocumentDTO: CreateDocumentDTO, @UploadedFile() file: Express.Multer.File, @CurrentUser('tenantId') tenantId: number) {
        return await this.documentService.create(createDocumentDTO, file, tenantId);
    }
}
