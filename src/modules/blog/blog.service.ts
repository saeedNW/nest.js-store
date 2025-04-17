import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { paginate, PaginatedResult, PaginationDto } from 'src/common/utils/typeorm.pagination.utility';
import { FindBlogsDto } from './dto/find-blog.dto';
import { createSlug, deleteInvalidPropertyInObject, randomId } from 'src/common/utils/functions.utils';
import { escapeAndTrim } from 'src/common/utils/sanitizer.utility';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RoleService } from '../role/role.service';
import { Permissions } from 'src/common/enums/permissions.enum';
import { CategoryEntity } from '../category/entities/category.entity';
import { CategoryType } from '../category/enum/category-type.enum';
import { BlogStatus } from './enums/status.enum';
import { UserEntity } from '../user/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
	constructor(
		// Register blog repository
		@InjectRepository(BlogEntity)
		private blogRepository: Repository<BlogEntity>,
		// Register category repository
		@InjectRepository(CategoryEntity)
		private categoryRepository: Repository<CategoryEntity>,
		// Make the current request accessible in service
		@Inject(REQUEST) private request: Request,
		// Register i18n service
		private readonly i18n: I18nService,
		// Register role service
		private readonly roleService: RoleService,
	) { }

	/**
	 * Creates a new blog post
	 * @param {CreateBlogDto} createBlogDto - Blog creation data
	 */
	async create(createBlogDto: CreateBlogDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(createBlogDto);
		escapeAndTrim(createBlogDto);

		// Retrieve user data from request
		let { id: author } = this.getRequestUser();

		// Generate a unique slug
		const slug = await this.generateSlug(createBlogDto.title, createBlogDto.slug);

		// Fetch and validate categories
		const categories = await this.getValidCategories(createBlogDto.categories);

		// Create new blog data
		const blog: BlogEntity = this.blogRepository.create({
			...createBlogDto,
			slug,
			authorId: author,
			categories,
		});

		// Save blog data to database
		await this.blogRepository.save(blog);

		return this.i18n.t('locale.PublicMessages.SuccessCreate', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 * Retrieves a paginated list of blogs based on search criteria
	 * @param {PaginationDto} paginationDto - Pagination details
	 * @param {FindBlogsDto} findBlogsDto - Search filters for blogs
	 * @returns {Promise<PaginatedResult<BlogEntity>>} - A paginated list of blogs
	 */
	async findAll(paginationDto: PaginationDto, findBlogsDto: FindBlogsDto): Promise<PaginatedResult<BlogEntity>> {
		// Sanitize client data
		deleteInvalidPropertyInObject(findBlogsDto);
		escapeAndTrim(findBlogsDto);

		// Create the base query builder
		const queryBuilder = await this.buildBlogQuery(findBlogsDto);

		// Paginate the results
		return await paginate(
			paginationDto,
			this.blogRepository,
			queryBuilder,
			`${process.env.SERVER}/blog`,
			true
		);
	}

	/**
	 * Retrieves a paginated list of the user's blogs based on search criteria
	 * @param {PaginationDto} paginationDto - Pagination details
	 * @param {FindBlogsDto} findBlogsDto - Search filters for blogs
	 * @returns {Promise<PaginatedResult<BlogEntity>>} - A paginated list of user's blogs
	 */
	async findMyBlogs(paginationDto: PaginationDto, findBlogsDto: FindBlogsDto): Promise<PaginatedResult<BlogEntity>> {
		// Sanitize client data
		deleteInvalidPropertyInObject(findBlogsDto);
		escapeAndTrim(findBlogsDto);

		// Retrieve user data from request
		let { id: authorId } = this.getRequestUser();

		// Create the base query builder
		const queryBuilder = await this.buildBlogQuery(findBlogsDto, authorId);

		// Paginate the results
		const blogs = await paginate(
			paginationDto,
			this.blogRepository,
			queryBuilder,
			`${process.env.SERVER}/blog`,
			true
		);

		return blogs
	}

	/**
	 * Finds a blog post by its ID
	 * @param {number | string} find - Blog ID or slug
	 * @returns {Promise<BlogEntity>} - The blog entity
	 */
	async findOne(find: number | string): Promise<BlogEntity> {
		// Convert find value to number or undefined to prevent error for
		// using invalid value as integer for id search in where option
		const blogId = isNaN(Number(find)) ? undefined : Number(find);

		// Retrieve user data
		const user = this.getRequestUser(true);

		// Retrieve single blog data by its id or slug
		const queryBuilder = this.blogRepository
			.createQueryBuilder("blog")
			.andWhere([
				{ id: blogId },
				{ slug: find }
			])
			.innerJoin("blog.author", "author")
			.innerJoin("author.profile", "profile")
			.leftJoinAndSelect("blog.categories", "category")
			.select([
				"blog",
				"author.id",
				"profile.first_name",
				"profile.last_name",
				"profile.profile_image",
				"category.id",
				"category.title",
			])


		// Enforce blog status filtering based on the user role
		if (!user) {
			// Public users: Can only see published blogs
			queryBuilder.andWhere("blog.status = :status", { status: BlogStatus.PUBLISHED });
		} else {
			// Retrieve user's role data
			const userRole = await this.roleService.getRoleData(user.role.id);

			// Check if user has super access to blog section
			const hasSuperAccess = userRole?.permissions.some((perm) =>
				[Permissions.Master, Permissions['Blog.manager']].includes(perm.title as Permissions)
			);

			if (!hasSuperAccess) {
				// Writers: Can retrieve only their own drafts/trashed blogs
				queryBuilder.andWhere(
					new Brackets((qb) => {
						qb.where("blog.status = :published", { published: BlogStatus.PUBLISHED })
							.orWhere("blog.authorId = :authorId",{ authorId: user.id });
					})
				);
			}
		}

		// Execute the query
		const blog = await queryBuilder.getOne();

		// Throw error if blog was not found
		if (!blog) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.BlogNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return blog;
	}

	/**
	 * Updates an existing blog post
	 * @param {number} id - Blog ID
	 * @param {UpdateBlogDto} updateBlogDto - Updated blog data
	 */
	async update(id: number, updateBlogDto: UpdateBlogDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(updateBlogDto);
		escapeAndTrim(updateBlogDto);

		// Retrieve blogs data
		const blog = await this.findOne(id);

		// Validate user access to modify the blog
		await this.permissionValidation(blog);

		// Generate a new slug if the title or slug has changed
		if (updateBlogDto.slug || updateBlogDto.title) {
			blog.slug = await this.generateSlug(updateBlogDto.title ?? blog.title, updateBlogDto.slug, id);
		}

		// Fetch and validate categories if provided
		if (updateBlogDto.categories) {
			blog.categories = await this.getValidCategories(updateBlogDto.categories);
		}

		// Merge updated fields into the existing blog object
		Object.assign(blog, updateBlogDto);

		// Save updated blog data
		await this.blogRepository.save(blog);

		return this.i18n.t('locale.PublicMessages.SuccessUpdate', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 * Remove blog
	 * @param {number} id - Blog ID
	 */
	async remove(id: number) {
		// Check blog existence
		const blog = await this.findOne(id);
		// Validate user access to modify the blog
		await this.permissionValidation(blog);

		// Remove blog
		await this.blogRepository.delete({ id });

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
			lang: I18nContext?.current()?.lang
		})
	}
	/**
	 * Move blog to trash
	 * @param {number} id - Blog ID
	 */
	async trash(id: number) {
		// Check blog existence
		const blog = await this.findOne(id);
		// Validate user access to modify the blog
		await this.permissionValidation(blog);

		// Remove blog
		await this.blogRepository.update({ id }, { status: BlogStatus.TRASHED });

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 * Validate blog existence
	 * @param id - The Blog ID
	 * @param status - The Blog Status
	 * @returns {Promise<BlogEntity>}
	 */
	async validateExistence(id: number, status?: BlogStatus): Promise<BlogEntity> {
		// Generate find query
		const where: { id: number, status?: BlogStatus } = { id }
		if (status) where.status = status;

		// Retrieve blog data
		const blog = await this.blogRepository.findOne({ where });

		// Throw error if blog was not found
		if (!blog) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.BlogNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return blog;
	}

	/**
	 * Fetch and validate categories from the database
	 * @param {string[]} [categoryIds] + List of category IDs
	 */
	private async getValidCategories(categoryIds?: string[]): Promise<CategoryEntity[]> {
		if (!categoryIds?.length) return [];

		for (const id of categoryIds) {
			if (isNaN(+id)) {
				throw new BadRequestException(this.i18n.t('locale.BadRequestMessages.InvalidCategory', {
					lang: I18nContext?.current()?.lang
				}));
			}
		}

		return this.categoryRepository.findBy({ id: In(categoryIds), type: CategoryType.BLOG });
	}

	/**
	 * Builds the query for retrieving blogs based on filters
	 * @param {FindBlogsDto} filters - The filters for searching blogs
	 * @param {number} authorId - The author ID
	 * @returns {Promise<SelectQueryBuilder<BlogEntity>>} - The built query
	 */
	private async buildBlogQuery(filters: FindBlogsDto, authorId?: number): Promise<SelectQueryBuilder<BlogEntity>> {
		// Retrieve user data
		const user = this.getRequestUser(true);

		const queryBuilder = this.blogRepository
			.createQueryBuilder("blog")
			.leftJoin("blog.author", "author")
			.leftJoin("author.profile", "profile")
			.leftJoinAndSelect("blog.categories", "category")
			.select([
				"blog",
				"author.id",
				"profile.first_name",
				"profile.last_name",
				"profile.profile_image",
				"category.id",
				"category.title",
			]);

		// Apply author ID filter if provided
		if (authorId) {
			queryBuilder.andWhere("author.id = :authorId", { authorId });
		}

		// Enforce blog status filtering based on the user role
		if (!user) {
			// Public users: Can only see published blogs
			queryBuilder.andWhere("blog.status = :status", { status: BlogStatus.PUBLISHED });
		} else {
			// Retrieve user's role data
			const userRole = await this.roleService.getRoleData(user.role.id);

			// Check if user has super access to blog section
			const hasSuperAccess = userRole?.permissions.some((perm) =>
				[Permissions.Master, Permissions['Blog.manager']].includes(perm.title as Permissions)
			);

			if (hasSuperAccess) {
				// Admins & Blog Managers: Can filter by any status
				if (filters.status) {
					queryBuilder.andWhere("blog.status = :status", { status: filters.status });
				}
			} else {
				// Writers: Can retrieve only their own drafts/trashed blogs
				queryBuilder.andWhere(
					new Brackets((qb) => {
						qb.where("blog.status = :published", { published: BlogStatus.PUBLISHED })
							.orWhere(
								"blog.status = :status AND blog.authorId = :authorId",
								{ status: filters.status || BlogStatus.PUBLISHED, authorId: user.id }
							);
					})
				);
			}
		}

		// Filter by category title (exact match, can be changed to ILIKE for case-insensitive)
		if (filters.category) {
			queryBuilder.andWhere("category.title ILIKE :categoryTitle", {
				categoryTitle: filters.category,
			});
		}

		// Apply search filter if provided
		if (filters.search) {
			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where("blog.title ILIKE :search", { search: `%${filters.search}%` })
						.orWhere("blog.slug ILIKE :search", { search: `%${filters.search}%` })
						.orWhere("blog.description ILIKE :search", { search: `%${filters.search}%` })
						.orWhere("blog.content ILIKE :search", { search: `%${filters.search}%` })
						.orWhere("profile.first_name ILIKE :search", { search: `%${filters.search}%` })
						.orWhere("profile.last_name ILIKE :search", { search: `%${filters.search}%` });
				})
			);
		}

		return queryBuilder;
	}

	/**
	 * Retrieve user's data saved in request
	 */
	private getRequestUser(isPublicRoute: true): UserEntity | null;
	private getRequestUser(isPublicRoute?: false): UserEntity;
	private getRequestUser(isPublicRoute: boolean = false) {
		// Retrieve user data from request
		let user = this.request.user;

		// User not found handler
		if (!user) {
			// Return null if the request is from a public route and
			// user existence is not important
			if (isPublicRoute) return null;

			// Throw error if the user's existence is
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.AccountNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return user;
	}

	/**
	 * Validates if the user has the necessary permissions to modify the blog
	 * @param {BlogEntity} blog - The blog entity to check permissions for
	 * @returns {Promise<boolean>} - Returns `true` if the user has permission
	 */
	private async permissionValidation(blog: BlogEntity): Promise<boolean> {
		// Retrieve user data and role
		const user = this.getRequestUser();
		const userRole = await this.roleService.findOne(user.role.id);

		// Check if user has the required permissions
		const hasSuperAccess = userRole.permissions.some((perm) =>
			[Permissions.Master, Permissions['Blog.manager']].includes(perm.title as Permissions)
		);
		if (hasSuperAccess) return true;

		// If user does not super access to blog section then,
		//  they have to be the author to be able to modify the blog
		if (blog.authorId !== user.id) {
			throw new BadRequestException(this.i18n.t('locale.BadRequestMessages.NotTheAuthor', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return true;
	}

	/**
	 * Finds a blog by its slug
	 * @param {string} slug - Blog slug
	 * @returns {Promise<BlogEntity | null>} - The blog entity or null if not found
	 */
	private async findBlogBySlug(slug: string): Promise<BlogEntity | null> {
		return this.blogRepository.findOne({ where: { slug } });
	}

	/**
	 * Generates a unique slug for a blog post
	 * @param {string} title - Blog title
	 * @param {string} [customSlug] - Optional custom slug
	 * @param {number} [excludeId] - ID to exclude from duplication check
	 * @returns {Promise<string>} - Unique slug
	 */
	private async generateSlug(title: string, customSlug?: string, excludeId?: number): Promise<string> {
		let slug = createSlug(customSlug || title);
		const existingBlog = await this.findBlogBySlug(slug);

		// If slug exists and belongs to a different blog, append a random ID
		if (existingBlog && existingBlog.id !== excludeId) {
			slug += `-${randomId()}`;
		}

		return slug;
	}
}
