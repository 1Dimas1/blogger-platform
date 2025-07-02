import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

export class GetPostsQueryParams extends BaseQueryParams {
  sortBy: PostsSortBy = PostsSortBy.CreatedAt;
}

enum PostsSortBy {
  CreatedAt = 'createdAt',
  Title = 'title',
  ShortDescription = 'shortDescription',
  Content = 'content',
  BlogName = 'blogName',
}
