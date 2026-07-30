import {
  Controller,
  Body,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtClaims } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { PostLikesService } from './post-likes.service';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly postLikesService: PostLikesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Cria um post autenticado' })
  @ApiCreatedResponse({ description: 'Post público criado' })
  create(@CurrentUser() user: JwtClaims, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista posts publicamente' })
  @ApiQuery({ name: 'q', required: false, type: String, maxLength: 100 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
  @ApiOkResponse({ description: 'Posts paginados' })
  @ApiBadRequestResponse({
    description: 'Par\u00e2metros de consulta inv\u00e1lidos',
  })
  list(@Query() query: ListPostsQueryDto) {
    return this.postsService.list(query);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Lista comentários publicamente' })
  @ApiOkResponse({ description: 'Comentários paginados' })
  @ApiBadRequestResponse({
    description: 'Identificador ou paginação inválidos',
  })
  @ApiNotFoundResponse({ description: 'Post não encontrado' })
  listComments(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Query() query: ListCommentsQueryDto,
  ) {
    return this.commentsService.list(id, query);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Cria comentário autenticado' })
  @ApiCreatedResponse({ description: 'Comentário público criado' })
  createComment(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @CurrentUser() user: JwtClaims,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(id, user.sub, dto);
  }

  @Get(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Consulta a curtida do usuário atual' })
  likeState(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @CurrentUser() user: JwtClaims,
  ) {
    return this.postLikesService.get(id, user.sub);
  }

  @Put(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Curte um post de forma idempotente' })
  like(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @CurrentUser() user: JwtClaims,
  ) {
    return this.postLikesService.like(id, user.sub);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Remove uma curtida de forma idempotente' })
  unlike(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @CurrentUser() user: JwtClaims,
  ) {
    return this.postLikesService.unlike(id, user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obt\u00e9m publicamente os detalhes de um post' })
  @ApiOkResponse({ description: 'Detalhe p\u00fablico do post' })
  @ApiBadRequestResponse({ description: 'Identificador inv\u00e1lido' })
  @ApiNotFoundResponse({ description: 'Post n\u00e3o encontrado' })
  detail(
    @Param(
      'id',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ) {
    return this.postsService.findDetail(id);
  }
}
