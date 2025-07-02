import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findById(id);
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async delete(comment: CommentDocument): Promise<void> {
    await comment.deleteOne();
  }

  async findOrNotFoundFail(id: string): Promise<CommentDocument> {
    const comment: CommentDocument | null = await this.findById(id);

    if (!comment) {
      throw new NotFoundException('comment not found');
    }

    return comment;
  }
}
