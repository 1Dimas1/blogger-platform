import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createComment(
    postId: string,
    dto: CreateCommentDto,
    userId: string,
  ): Promise<string> {
    await this.postsRepository.findOrNotFoundFail(postId);

    // TODO: Get user info from UserRepository
    const userLogin = 'temp-login';

    const comment: CommentDocument = this.CommentModel.createInstance({
      content: dto.content,
      commentatorInfo: {
        userId,
        userLogin,
      },
      postId,
    });

    await this.commentsRepository.save(comment);

    return comment._id.toString();
  }

  async updateComment(
    id: string,
    dto: UpdateCommentDto,
    userId: string,
  ): Promise<void> {
    const comment: CommentDocument =
      await this.commentsRepository.findOrNotFoundFail(id);

    if (!comment.isOwnedBy(userId)) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.update(dto);

    await this.commentsRepository.save(comment);
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    const comment: CommentDocument =
      await this.commentsRepository.findOrNotFoundFail(id);

    if (!comment.isOwnedBy(userId)) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.delete(comment);
  }
}
