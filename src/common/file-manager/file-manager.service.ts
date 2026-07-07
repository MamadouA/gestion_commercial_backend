import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3ClientService } from './s3-client.service';
import { PrismaClientService } from '../../database/prisma-client.service';
import { FileMetadata } from '../../shared/shared.types';

@Injectable()
export class FileManagerService {
    constructor(private readonly s3ClientService: S3ClientService, private readonly prismaClientService: PrismaClientService) {}

    // -
    async createDocument(ownerIdFieldName: string, ownerId: number, file: Express.Multer.File) {
    let fileMetadata: FileMetadata = {
      mimetype: "",
      originalName: "",
      size: 0,
      storedName: "",
    };

    try {
      fileMetadata = await this.s3ClientService.save(file);

      return await this.prismaClientService.document.create({
          data: {
            originalName: file.originalname,
            storedName: fileMetadata.storedName,
            size: file.size,
            mimetype: file.mimetype,
            [ownerIdFieldName]: ownerId
          },
        });

    } catch (err) {
      if(fileMetadata.storedName.length > 0) {
        await this.s3ClientService.deleteBykey(fileMetadata.storedName);
      }
      console.log('Error while uploading the file: ', err);
      throw new InternalServerErrorException('Error while uploading the file.');
    }
  }
}
