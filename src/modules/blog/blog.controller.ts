import {
	Controller, Get, Post, Body, Param,
	Delete, ParseIntPipe, Query, Put
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
	UpdateBlogResponses
} from './decorators/swagger-responses.decorator';

@Controller('blog')
@ApiTags("Blog")
export class BlogController {
	constructor(private readonly blogService: BlogService) { }

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
		return this.blogService.create(createBlogDto);
	}

	/**
	 * Retrieves a paginated list of blogs based on search criteria
	 * @param {PaginationDto} paginationDto - Pagination details
	 * @param {FindBlogsDto} findBlogsDto - Search filters for blogs
	 */
	@Get()
	@FindAllBlogsResponses()
	findAll(
		@Query() paginationDto: PaginationDto,
		@Query() findBlogsDto: FindBlogsDto,
	) {
		return this.blogService.findAll(paginationDto, findBlogsDto);
	}

	/**
	 * Retrieves a paginated list of the user's blogs based on search criteria
	 * @param {PaginationDto} paginationDto - Pagination details
	 * @param {FindBlogsDto} findBlogsDto - Search filters for blogs
	 */
	@Get('/mine')
	@AuthDecorator()
	@PermissionDecorator(Permissions['Blog.writer'], Permissions['Blog.manager'])
	@ApiOperation({ summary: "[ RBAC ] - Create new blog" })
	@FindAllBlogsResponses()
	findMyBlogs(
		@Query() paginationDto: PaginationDto,
		@Query() findBlogsDto: FindBlogsDto,
	) {
		return this.blogService.findMyBlogs(paginationDto, findBlogsDto);
	}

	/**
	 * Finds a blog post by its ID or slug
	 * @param {FindOneBlogDto} params - Blog ID or Slug
	 */
	@Get(':find')
	@FindOneBlogResponses()
	findOne(@Param() params: FindOneBlogDto) {
		return this.blogService.findOne(params.find);
	}

	/**
	 * Updates an existing blog post
	 * @param {number} blogId - Blog ID
	 * @param {UpdateBlogDto} updateBlogDto - Updated blog data
	 */
	@Put(':blogId')
	@Post()
	@AuthDecorator()
	@PermissionDecorator(Permissions['Blog.writer'], Permissions['Blog.manager'])
	@ApiOperation({
		summary: "[ RBAC ] - Upload blog",
		description: "<b>Note:</b> A user with the blog writer permission can only update their own blog, while a user with the blog manager or system master permission can update any blog"
	})
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@UpdateBlogResponses()
	update(@Param('blogId', ParseIntPipe) blogId: number, @Body() updateBlogDto: UpdateBlogDto) {
		return this.blogService.update(blogId, updateBlogDto);
	}

	/**
	 * Remove blog
	 * @param {number} blogId - Blog ID
	 */
	@Delete(':blogId')
	@Post()
	@AuthDecorator()
	@PermissionDecorator(Permissions['Blog.writer'], Permissions['Blog.manager'])
	@ApiOperation({
		summary: "[ RBAC ] - Remove blog",
		description: "<b>Note:</b> A user with the blog writer permission can only remove their own blog, while a user with the blog manager or system master permission can remove any blog"
	})
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@RemoveBlogResponses()
	remove(@Param('blogId', ParseIntPipe) blogId: number) {
		return this.blogService.remove(blogId);
	}
}
