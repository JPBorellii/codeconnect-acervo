import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
