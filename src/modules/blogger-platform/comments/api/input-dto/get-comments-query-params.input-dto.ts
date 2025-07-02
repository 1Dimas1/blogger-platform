import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

export class GetCommentsQueryParams extends BaseQueryParams {
  sortBy: CommentsSortBy = CommentsSortBy.CreatedAt;
}

enum CommentsSortBy {
  CreatedAt = 'createdAt',
  Content = 'content',
}
