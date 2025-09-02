import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UserViewDto } from './view-dto/users.view-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { Constants } from '../../../core/constants';
import {
  ApiBasicAuth,
  ApiParam,
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-transformation-pipe.service';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';

@ApiTags('Users')
@Controller(Constants.PATH.USERS)
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {}

  @ApiBasicAuth('basicAuth')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: UserViewDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'Returns user by id' })
  @Get(':id')
  @UseGuards(BasicAuthGuard)
  async getById(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<UserViewDto> {
    return this.usersQueryRepository.getByIdOrNotFoundFail(id);
  }

  @ApiBasicAuth('basicAuth')
  @ApiOperation({ summary: 'Returns all users' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: 'PaginatedViewDto<UserViewDto[]>',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @ApiBasicAuth('basicAuth')
  @ApiOperation({ summary: 'Add new user to the system' })
  @ApiResponse({ status: 201, type: UserViewDto })
  @ApiResponse({ status: 400, description: 'Bad request - validation errors' })
  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId: string = await this.usersService.createUser(body);

    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @ApiBasicAuth('basicAuth')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({ summary: 'Update existing user' })
  @ApiResponse({ status: 200, type: UserViewDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Put(':id')
  @UseGuards(BasicAuthGuard)
  async updateUser(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: UpdateUserInputDto,
  ): Promise<UserViewDto> {
    const userId: string = await this.usersService.updateUser(id, body);
    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @ApiBasicAuth('basicAuth')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiOperation({ summary: 'Delete user specified by id' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
