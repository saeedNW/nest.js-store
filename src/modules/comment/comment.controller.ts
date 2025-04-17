import { Controller, Post, Body, Get, Query, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthDecorator } from 'src/common/decorator/auth.decorator';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/configs/swagger.config';
import { PaginationDto } from 'src/common/utils/typeorm.pagination.utility';
import { PermissionDecorator } from 'src/common/decorator/permission.decorator';
import { FindCommentsDto } from './dto/find-comments.dto';
import { Permissions } from 'src/common/enums/permissions.enum';
import { plainToClass } from 'class-transformer';
import { FindAllCommentsDto } from './dto/find-all-comments.dto';

@Controller('comment')
@ApiTags("Comment")
export class CommentController {
	constructor(private readonly commentService: CommentService) { }

	// ===================== User APIs =======================

	/**
	 * Create a new comment
	 * @param {CreateCommentDto} createCommentDto - The data to create a comment
	 */
	@Post()
	@AuthDecorator()
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	create(@Body() createCommentDto: CreateCommentDto) {
		// filter client data and remove unwanted data
		createCommentDto = plainToClass(CreateCommentDto, createCommentDto, {
			excludeExtraneousValues: true,
		});

		return this.commentService.create(createCommentDto);
	}

	// ===================== Public APIs =====================

	@Get('/:type/:targetId')
	find(
		@Param() findCommentsDto: FindCommentsDto,
		@Query() paginationDto: PaginationDto
	) {
		// filter client data and remove unwanted data
		paginationDto = plainToClass(PaginationDto, paginationDto, {
			excludeExtraneousValues: true,
		});

		return this.commentService.find(findCommentsDto, paginationDto)
	}

	// ===================== Admin APIs ======================

	@Get()
	@AuthDecorator()
	@PermissionDecorator(Permissions['Comment.manager'])
	@ApiOperation({ summary: "[ RBAC ] - Retrieve all comments" })
	findAll(
		@Query() paginationDto: PaginationDto,
		@Query() findAllCommentsDto: FindAllCommentsDto,
	) {
		// filter client data and remove unwanted data
		paginationDto = plainToClass(PaginationDto, paginationDto, {
			excludeExtraneousValues: true,
		});

		// filter client data and remove unwanted data
		findAllCommentsDto = plainToClass(FindAllCommentsDto, findAllCommentsDto, {
			excludeExtraneousValues: true,
		});

		return findAllCommentsDto

		// TODO: Add accepted status filter

		return this.commentService.findAll(findAllCommentsDto, paginationDto)
	}

	// TODO: Replay

	@Patch("/accept/:id")
	@AuthDecorator()
	@PermissionDecorator(Permissions['Comment.manager'])
	@ApiOperation({ summary: "[ RBAC ] - Accept comment" })
	accept(@Param("id", ParseIntPipe) id: number) {

	}

	@Patch("/reject/:id")
	@AuthDecorator()
	@PermissionDecorator(Permissions['Comment.manager'])
	@ApiOperation({ summary: "[ RBAC ] - Reject comment" })
	reject(@Param("id", ParseIntPipe) id: number) {

	}
}
