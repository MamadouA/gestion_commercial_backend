import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { CreateCommentDTO } from './dto/create.comment.dto';
import { CurrentUserType } from '../auth/auth.types';

@Injectable()
export class CommentService {
    private logger = new Logger(CommentService.name);
    constructor(private prismaClientService: PrismaClientService) {}

    // -
    async create(createCommentDTO: CreateCommentDTO, user: CurrentUserType) {
        try {
            const data = { authorId: user.id, content: createCommentDTO.content };

            switch(createCommentDTO.resourceType) {
                case 'PROJECT':
                    const project = await this.prismaClientService.project.findUnique({ where: { id: createCommentDTO.resourceId, tenantId: user.tenantId} });
                    if(!project) {
                        throw new NotFoundException('Project not found.');
                    }
                    data['projectId'] = project.id;

                    break;
                case 'OFFER':
                    const offer = await this.prismaClientService.offer.findUnique({ where: { id: createCommentDTO.resourceId, tenantId: user.tenantId } });
                    if(!offer) {
                        throw new NotFoundException('Offer not found.');
                    }
                    data['offerId'] = offer.id;
                    break;

                case 'PROSPECTION':
                    const prospection = await this.prismaClientService.prospection.findUnique({ where: { id: createCommentDTO.resourceId, tenantId: user.tenantId } });
                    if(!prospection) {
                        throw new NotFoundException('Prospection not found.');
                    }
                    data['prospectionId'] = prospection.id;
                    break;
            }

            return await this.prismaClientService.comment.create({ data, 
                select: {
                    content: true,
                    createdAt: true,
                    author: {
                        select: {
                            id: true,
                            fullname: true,
                            email: true,
                        }
                    }
                }
            });
        }
        catch(err) {
            this.logger.error('Error while creating the comment: ', err);
            throw new InternalServerErrorException('Error while creating the comment.');
        }
    }
}
