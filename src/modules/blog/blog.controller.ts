import {
	Controller, Get, Post, Body, Param,
	Delete, ParseIntPipe, Query, Put,
	Patch
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from 'src/common/decorator/auth.decorator';
import { SwaggerConsumes } from 'src/configs/swagger.config';
import { PermissionDecorator } from 'src/common/decorator/permission.decorator';
import { Permissions } from 'src/common/enums/permissions.enum';
import { PaginationDto } from 'src/common/utils/typeorm.pagination.utility';
import { FindBlogsDto, FindOneBlogDto } from './dto/find-blog.dto';
import {
	CreateBlogResponses,
	FindAllBlogsResponses,
	FindOneBlogResponses,
	RemoveBlogResponses,
	TrashBlogResponses,
	UpdateBlogResponses
} from './decorators/swagger-responses.decorator';
import { plainToClass } from 'class-transformer';

@Controller('blog')
@ApiTags("Blog")
export class BlogController {
	constructor(private readonly blogService: BlogService) { }

	// ===================== Public APIs =====================

	/**
	 * Retrieves a paginated list of blogs based on search criteria
	 * @param {PaginationDto} paginationDto - Pagination details
	 * @param {FindBlogsDto} findBlogsDto - Search filters for blogs
	 */
	@Get()
	@FindAllBlogsResponses()
	@ApiOperation({
		description: "Enforce blog status filtering based on the user role:<br>" +
			"<b>Public users:</b> Can only see published blogs<br>" +
			"<b>Admins & Blog Managers:</b> Can filter by any status<br>" +
			"<b>Writers:</b> Can retrieve only their own drafts / trashed blogs"
	})
	findAll(
		@Query() paginationDto: PaginationDto,
		@Query() findBlogsDto: FindBlogsDto,
	) {
		// filter client data and remove unwanted data
		paginationDto = plainToClass(PaginationDto, paginationDto, {
			excludeExtraneousValues: true,
		});

		return this.blogService.findAll(paginationDto, findBlogsDto);
	}

	/**
	 * Finds a blog post by its ID or slug
	 * @param {FindOneBlogDto} params - Blog ID or Slug
	 */
	@Get('/single/:find')
	@FindOneBlogResponses()
	findOne(@Param() params: FindOneBlogDto) {
		return this.blogService.findOne(params.find);
	}

	// ===================== Admin APIs ======================

	/**
	 * Creates a new blog post
	 * @param {CreateBlogDto} createBlogDto - Blog creation data
	 */
	@Post()
	@AuthDecorator()
	@PermissionDecorator(Permissions['Blog.writer'], Permissions['Blog.manager'])
	@ApiOperation({ summary: "[ RBAC ] - Create new blog" })
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@CreateBlogResponses()
	create(@Body() createBlogDto: CreateBlogDto) {
		// filter client data and remove unwanted data
		createBlogDto = plainToClass(CreateBlogDto, createBlogDto, {
			excludeExtraneousValues: true,
		});

		return this.blogService.create(createBlogDto);
	}

	/**
	 * Retrieves a paginated list of the user's blogs based on search criteria
	 * @param {PaginationDto} paginationDto - Pagination details
	 * @param {FindBlogsDto} findBlogsDto - Search filters for blogs
	 */
	@Get('/mine')
	@AuthDecorator()
	@PermissionDecorator(Permissions['Blog.writer'])
	@ApiOperation({ summary: "[ RBAC ] - Retrieve current user's blogs" })
	@FindAllBlogsResponses()
	findMyBlogs(
		@Query() paginationDto: PaginationDto,
		@Query() findBlogsDto: FindBlogsDto,
	) {
		// filter client data and remove unwanted data
		paginationDto = plainToClass(PaginationDto, paginationDto, {
			excludeExtraneousValues: true,
		});

		return this.blogService.findMyBlogs(paginationDto, findBlogsDto);
	}

	/**
	 * Updates an existing blog post
	 * @param {number} id - Blog ID
	 * @param {UpdateBlogDto} updateBlogDto - Updated blog data
	 */
	@Put(':id')
	@AuthDecorator()
	@PermissionDecorator(Permissions['Blog.writer'], Permissions['Blog.manager'])
	@ApiOperation({
		summary: "[ RBAC ] - Upload blog",
		description: "<b>Note:</b> A user with the blog writer permission can only update their own blog, while a user with the blog manager or system master permission can update any blog"
	})
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@UpdateBlogResponses()
	update(@Param('id', ParseIntPipe) id: number, @Body() updateBlogDto: UpdateBlogDto) {
		// filter client data and remove unwanted data
		updateBlogDto = plainToClass(UpdateBlogDto, updateBlogDto, {
			excludeExtraneousValues: true,
		});

		return this.blogService.update(id, updateBlogDto);
	}

	/**
	 * Move blog to trash
	 * @param {number} id - Blog ID
	 */
	@Patch(':id')
	@AuthDecorator()
	@PermissionDecorator(Permissions['Blog.writer'], Permissions['Blog.manager'])
	@ApiOperation({
		summary: "[ RBAC ] - Move blog to trash",
		description: "<b>Note:</b> A user with the blog writer permission can only trash their own blog, while a user with the blog manager or system master permission can trash any blog"
	})
	@TrashBlogResponses()
	trash(@Param('id', ParseIntPipe) id: number) {
		return this.blogService.trash(id);
	}

	/**
	 * Remove blog
	 * @param {number} id - Blog ID
	 */
	@Delete(':id')
	@AuthDecorator()
	@PermissionDecorator(Permissions['Blog.writer'], Permissions['Blog.manager'])
	@ApiOperation({
		summary: "[ RBAC ] - Remove blog",
		description: "<b>Note:</b> A user with the blog writer permission can only remove their own blog, while a user with the blog manager or system master permission can remove any blog"
	})
	@RemoveBlogResponses()
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.blogService.remove(id);
	}
}
