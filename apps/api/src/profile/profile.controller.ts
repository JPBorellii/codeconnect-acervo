import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtClaims } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListMyPostsQueryDto } from './dto/list-my-posts-query.dto';
import { PaginatedProfilePostsResponseDto } from './profile.responses';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me/posts')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Lista os posts do usu\u00e1rio autenticado' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
  @ApiOkResponse({
    description: 'Posts p\u00fablicos paginados do usu\u00e1rio',
    type: PaginatedProfilePostsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Par\u00e2metros de consulta inv\u00e1lidos',
  })
  @ApiUnauthorizedResponse({ description: 'N\u00e3o autorizado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno' })
  listMyPosts(
    @CurrentUser() user: JwtClaims,
    @Query() query: ListMyPostsQueryDto,
  ) {
    return this.profileService.listMyPosts(user.sub, query);
  }
}
