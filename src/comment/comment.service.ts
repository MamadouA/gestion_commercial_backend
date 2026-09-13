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
                    const project = await this.prismaClientService.project.findFirstOrThrow({ where: { id: createCommentDTO.resourceId, tenantId: user.tenantId} });
                    data['projectId'] = project.id;

                    break;
                case 'LEAD':
                    const lead = await this.prismaClientService.lead.findFirstOrThrow({ where: { id: createCommentDTO.resourceId, tenantId: user.tenantId } });
                   
                    data['leadId'] = lead.id;
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
