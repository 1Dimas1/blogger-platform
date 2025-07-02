import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { LikesService } from '../../likes/application/likes.service';
import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { LikeInputDto } from '../../likes/api/input-dto/like.input-dto';
import { SETTINGS } from '../../../../core/settings';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { CommentsService } from '../application/comments.service';

@Controller(SETTINGS.PATH.COMMENTS)
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
    private likesService: LikesService,
  ) {}

  @Get(':id')
  async getComment(
    @Param('id') id: string,
    // @UserId() userId?: string, // TODO: Implement optional auth decorator
  ): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id, null);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') id: string,
    @Body() body: UpdateCommentInputDto,
    // @UserId() userId: string, // TODO: Implement auth decorator
  ): Promise<void> {
    const userId = 'temp-user-id'; // TODO: Get from auth

    return this.commentsService.updateComment(id, body, userId);
  }

  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateCommentLikeStatus(
    @Param('id') commentId: string,
    @Body() body: LikeInputDto,
    // @UserId() userId: string, // TODO: Implement auth decorator
  ): Promise<void> {
    const userId = 'temp-user-id'; // TODO: Get from auth

    return this.likesService.updateCommentLikeStatus(commentId, body, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('id') id: string,
    // @UserId() userId: string, // TODO: Implement auth decorator
  ): Promise<void> {
    const userId = 'temp-user-id'; // TODO: Get from auth

    return this.commentsService.deleteComment(id, userId);
  }
}
