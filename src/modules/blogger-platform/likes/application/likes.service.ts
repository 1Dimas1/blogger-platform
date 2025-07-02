import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeDto } from '../dto/like.dto';
import {
  Like,
  LikeDocument,
  LikeModelType,
  LikeStatus,
} from '../domain/like.entity';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { PostsService } from '../../posts/application/posts.service';
import { LikesRepository } from '../infrastructure/likes.repository';
import { LikeDetails } from '../../posts/domain/extended-likes-info.schema';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    private likesRepository: LikesRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    @Inject(forwardRef(() => PostsService))
    private postsService: PostsService,
  ) {}

  async updatePostLikeStatus(
    postId: string,
    dto: LikeDto,
    userId: string,
  ): Promise<void> {
    // Verify post exists
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId);

    const existingLike: LikeDocument | null =
      await this.likesRepository.findByUserAndParent(userId, postId, 'post');

    if (existingLike) {
      if (existingLike.status === dto.likeStatus) {
        return;
      }
      existingLike.updateStatus(dto.likeStatus);
      await this.likesRepository.save(existingLike);
    } else {
      const like: LikeDocument = this.LikeModel.createInstance({
        userId,
        parentId: postId,
        parentType: 'post',
        status: dto.likeStatus,
      });

      await this.likesRepository.save(like);
    }

    // Update post likes info
    await this.updatePostLikesInfo(postId);
  }

  async updateCommentLikeStatus(
    commentId: string,
    dto: LikeDto,
    userId: string,
  ): Promise<void> {
    // Verify comment exists
    await this.commentsQueryRepository.getByIdOrNotFoundFail(commentId, userId);

    const existingLike = await this.likesRepository.findByUserAndParent(
      userId,
      commentId,
      'comment',
    );

    if (existingLike) {
      if (existingLike.status === dto.likeStatus) {
        return; // No change needed
      }
      existingLike.updateStatus(dto.likeStatus);
      await this.likesRepository.save(existingLike);
    } else {
      const like: LikeDocument = this.LikeModel.createInstance({
        userId,
        parentId: commentId,
        parentType: 'comment',
        status: dto.likeStatus,
      });

      await this.likesRepository.save(like);
    }
  }

  private async updatePostLikesInfo(postId: string): Promise<void> {
    const likes = await this.likesRepository.findByParent(postId, 'post');

    const likesCount = likes.filter(
      (like) => like.status === LikeStatus.Like,
    ).length;
    const dislikesCount = likes.filter(
      (like) => like.status === LikeStatus.Dislike,
    ).length;

    const newestLikesData: LikeDocument[] =
      await this.likesRepository.findNewestLikes(postId, 'post', 3);

    const newestLikes: LikeDetails[] = await Promise.all(
      newestLikesData.map(async (like) => {
        // TODO: Get user login from UserRepository
        const login = 'temp-login'; // Placeholder
        return {
          addedAt: like.createdAt,
          userId: like.userId,
          login,
        };
      }),
    );

    await this.postsService.updatePostLikesInfo(
      postId,
      likesCount,
      dislikesCount,
      newestLikes,
    );
  }
}
