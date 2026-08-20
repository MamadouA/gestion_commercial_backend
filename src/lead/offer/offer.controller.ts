import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from '../../shared/current-user.decoration';
import { OfferService } from './offer.service';
import { CreateOfferDTO } from './dto/create-offer.dto';
import { User } from '../../generated/prisma/client';
import { UpdateOfferDTO } from './dto/update-offer.dto';
import { RemoveFileDTO } from '../../common/file-manager/dto/remove-file.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FILE_FILTER } from '../../common/common.constants';
import { OfferQueryDTO } from './dto/offer-query.dto';
import { CurrentUserType } from '../../auth/auth.types';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get('all')
  async findAll(@Query() query: OfferQueryDTO, @CurrentUser('tenantId') tenantId: number) {
    return this.offerService.findAll(query, tenantId);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('file',FILE_FILTER))
  async create(
    @Body() createOfferDto: CreateOfferDTO,
    @UploadedFiles() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.offerService.create(createOfferDto, file, user.id, user.tenantId);
  }

  @Post(':id/file/remove')
  async removeFile(
    @Body() storedName: RemoveFileDTO,
    @CurrentUser('tenantId') tenantId: number,
  ) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('tenantId') tenantId: number,
  ) {
    return this.offerService.findOne(id, tenantId);
  }

  @Patch(':id/update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOfferDto: UpdateOfferDTO,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.offerService.update(id, updateOfferDto, user);
  }

  @Post(':id/document/create')
  @UseInterceptors(FileInterceptor('file'))
  async createDocument(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File, @CurrentUser('tenantId') tenantId: number) {
    return this.offerService.createDocument(id, file, tenantId);
  }
}
