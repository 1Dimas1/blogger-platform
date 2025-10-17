import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LikesService } from '../../likes/application/likes.service';
import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { LikeInputDto } from '../../likes/api/input-dto/like.input-dto';
import { Constants } from '../../../../core/constants';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { CommentsService } from '../application/comments.service';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';

@ApiTags('Comments')
@Controller(Constants.PATH.COMMENTS)
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
    private likesService: LikesService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Return comment by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async getComment(@Param('id') id: string): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id, null);
  }

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update existing comment by id with InputModel' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'If try edit the comment that is not your own',
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async updateComment(
    @Param('commentId') id: string,
    @Body() body: UpdateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commentsService.updateComment(id, body, user.id);
  }

  @Put(':commentId/like-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Make like/unlike/dislike/undislike operation' })
  @ApiResponse({ status: 204, description: '' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: "If comment with specified id doesn't exists",
  })
  async updateCommentLikeStatus(
    @Param('commentId') commentId: string,
    @Body() body: LikeInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.likesService.updateCommentLikeStatus(commentId, body, user.id);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete comment specified by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'If try delete the comment that is not your own',
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async deleteComment(
    @Param('commentId') id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commentsService.deleteComment(id, user.id);
  }
}
