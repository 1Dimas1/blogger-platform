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
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { UpdateUserInputDto } from './input-dto/update-user.input-dto';
import { Types } from 'mongoose';
import { IdInputDTO } from './input-dto/users-sort-by';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-transformation-pipe.service';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';

@Controller(Constants.PATH.USERS)
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {}

  @ApiBasicAuth('basicAuth')
  @ApiParam({ name: 'id' })
  @Get(':id')
  @UseGuards(BasicAuthGuard)
  async getById(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<UserViewDto> {
    return this.usersQueryRepository.getByIdOrNotFoundFail(id);
  }

  @ApiBasicAuth('basicAuth')
  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @ApiBasicAuth('basicAuth')
  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId: string = await this.usersService.createUser(body);

    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @ApiBasicAuth('basicAuth')
  @ApiParam({ name: 'id', type: 'string' })
  @Put(':id')
  @UseGuards(BasicAuthGuard)
  async updateUser(
    @Param('id') id: Types.ObjectId,
    @Body() body: UpdateUserInputDto,
  ): Promise<UserViewDto> {
    const userId: string = await this.usersService.updateUser(id, body);

    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @ApiBasicAuth('basicAuth')
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: IdInputDTO): Promise<void> {
    return this.usersService.deleteUser(id.id);
  }
}
