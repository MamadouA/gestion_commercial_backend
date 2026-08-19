import { Body, Controller, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDTO } from './dto/create.comment.dto';
import { CurrentUserType } from '../auth/auth.types';
import { CurrentUser } from '../shared/current-user.decoration';

@Controller('comment')
export class CommentController {
    constructor (private commentService: CommentService) {}

    @Post('create')
    async create(@Body() createCommentDTO: CreateCommentDTO, @CurrentUser() user: CurrentUserType) {
        return await this.commentService.create(createCommentDTO, user);
    }
}
