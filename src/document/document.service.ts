import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { CreateDocumentDTO } from './dto/create-document.dto';
import { FileMetadata } from '../shared/shared.types';
import { S3ClientService } from '../common/file-manager/s3-client.service';

@Injectable()
export class DocumentService {
    constructor(private prismaClientService: PrismaClientService, private s3ClientService: S3ClientService) {}

    // -
    async create(createDocumentDTO: CreateDocumentDTO, file: Express.Multer.File, tenantId: number) {
        let fileMetadata: FileMetadata | null = null;
        try {
            fileMetadata = await this.s3ClientService.save(file);

            const data = {...fileMetadata, description: createDocumentDTO.summary};

            switch(createDocumentDTO.resourceType) {
                case "PROJECT": 
                    const project = await this.prismaClientService.project.findFirstOrThrow({
                        where: { id: createDocumentDTO.resourceId, tenantId }
                    });

                    data["projectId"] = project.id;
                    break;
                case "OFFER":
                    const offer = await this.prismaClientService.offer.findFirstOrThrow({
                        where: { id: createDocumentDTO.resourceId, tenantId }
                    });

                    data["offerId"] = offer.id;
                    break;
                case "PROSPECTION":
                    const prospection = await this.prismaClientService.prospection.findFirstOrThrow({
                        where: { id: createDocumentDTO.resourceId, tenantId }
                    });

                    data["prospectionId"] = prospection.id;
                    break;
            }

            return await this.prismaClientService.document.create({ data, 
                select: {
                    id: true,
                    originalName: true,
                    createdAt: true,
                    summary: true,
                    size: true,
                }
             });
        }
        catch(err) {
            if(fileMetadata) this.s3ClientService.delete(fileMetadata.storedName);
            console.log("Error while uploading the file: ", err);
            throw new InternalServerErrorException("Error while uploading the file.");
        }
    }
}
