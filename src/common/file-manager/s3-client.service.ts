import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Get, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { FileMetadata } from '../../shared/shared.types';
import { PrismaClientService } from '../../database/prisma-client.service';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3ClientService {
    private readonly s3Client: S3Client;

    constructor(private readonly prismaClientService: PrismaClientService) {
        this.s3Client = new S3Client({
            region: 'us-east-1',
            endpoint: process.env.RUSTFS_ENDPOINT ?? "",
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.RUSTFS_ACCESS_KEY_ID ?? "",
                secretAccessKey: process.env.RUSTFS_SECRET_KEY ?? "",
            },
        });
    }

    // -
    async save(file: Express.Multer.File) {
        const fileMetadata: FileMetadata = {
            originalName: file.originalname,
            storedName: `${crypto.randomUUID()}-${file.originalname}`,
            size: file.size,
            mimetype: file.mimetype,
        }

        try {
            await this.s3Client.send(new PutObjectCommand ({
                Bucket: process.env.RUSTFS_BUCKET_NAME,
                Key: fileMetadata.storedName,
                Body: file.buffer,
                ContentType: file.mimetype
            }));
        }
        catch(err) {
            console.log("Error while uploading the file: ", err);
            throw new InternalServerErrorException("Error while uploading the file.");
        }
        return fileMetadata;
    }

    // -
    async bulkSave(files: Array<Express.Multer.File>) {
        return await Promise.all(files.map(file => this.save(file)));
    }

    // -
    // async deleteById(id: number) {
    //     try {
    //         const document = await this.prismaClientService.document.findUnique({
    //             where: {
    //                 id
    //             }
    //         });

    //         if(!document) {
    //             throw new NotFoundException("File not found!");
    //         }

    //         return await this.s3Client.send(new DeleteObjectCommand ({
    //             Bucket: process.env.S3_BUCKET_NAME,
    //             Key: document.storedName
    //         }));
    //     }
    //     catch(err) {
    //         console.log("Error while deleting the file: ", err);
    //         throw new InternalServerErrorException("Error while deleting the file.");
    //     }
    // }

    // -
    async bulkDelete(metadatas: Array<FileMetadata>) {
        return await Promise.all(metadatas.map(metadata => this.delete(metadata.storedName)));
    }
    
    // -
    async delete(key: string) {
        try {
            return await this.s3Client.send(new DeleteObjectCommand ({
                Bucket: process.env.RUSTFS_BUCKET_NAME,
                Key: key
            }));
        }
        catch(err) {
            console.log("Error while deleting the file: ", err);
            throw new InternalServerErrorException("Error while deleting the file.");
        }
    }

    // -
    async generateDownloadUrl(storedName: string) {
        return getSignedUrl(this.s3Client, new GetObjectCommand({
            Bucket: process.env.RUSTFS_BUCKET_NAME,
            Key: storedName,
            ResponseContentDisposition: "inline"
        }))
    }
}
