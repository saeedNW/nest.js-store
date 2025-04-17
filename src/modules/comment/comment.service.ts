import { BadRequestException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { deleteInvalidPropertyInObject } from 'src/common/utils/functions.utils';
import { escapeAndTrim } from 'src/common/utils/sanitizer.utility';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { IsNull, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { BlogService } from '../blog/blog.service';
import { CommentType } from './enum/comment-type.enum';
import { BlogStatus } from '../blog/enums/status.enum';
import { FindCommentsDto } from './dto/find-comments.dto';
import { paginate, PaginationDto } from 'src/common/utils/typeorm.pagination.utility';
import { FindAllCommentsDto } from './dto/find-all-comments.dto';

@Injectable({ scope: Scope.REQUEST })
export class CommentService {
	constructor(
		// Register blog repository
		@InjectRepository(CommentEntity)
		private commentRepository: Repository<CommentEntity>,
		// Make the current request accessible in service
		@Inject(REQUEST) private request: Request,
		// Register i18n service
		private readonly i18n: I18nService,
		// Register blog service
		private blogService: BlogService
	) { }

	/**
	 * Create a new comment
	 * @param {CreateCommentDto} createCommentDto - The data to create a comment
	 */
	async create(createCommentDto: CreateCommentDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(createCommentDto);
		escapeAndTrim(createCommentDto);

		// Retrieve user data from request
		let { id: userId } = this.getRequestUser();

		// Validate the comment's target existence
		const target = await this.targetValidation(createCommentDto.targetId, createCommentDto.type);

		// Parent validation
		await this.parentValidation(createCommentDto.parentId, createCommentDto.type);

		// Insert comment into the database
		await this.commentRepository.insert({
			...createCommentDto,
			...target,
			userId
		});

		return this.i18n.t('locale.PublicMessages.SuccessCreate', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 *
	 * @param {FindCommentsDto} findCommentsDto - The data to find comments
	 * @param {CommentType} findCommentsDto.type - The type of the comment's target (blog or product)
	 * @param {number} findCommentsDto.targetId - The ID of the comment's target (blog or product)
	 * @param {PaginationDto} paginationDto - Pagination data
	 */
	async find(
		{ type, targetId }: FindCommentsDto,
		paginationDto: PaginationDto
	) {
		// Validate the comment's target existence
		const target = await this.targetValidation(targetId, type);

		// Create find process query builder
		const queryBuilder = this.commentRepository
			.createQueryBuilder("comment")
			.where({ ...target, parentId: IsNull(), accepted: true })
			.leftJoin("comment.user", "user")
			.leftJoin("user.profile", "userProfile")
			.leftJoin(
				"comment.children",
				"children",
				"children.accepted = :acceptedChild",
				{ acceptedChild: true }
			)
			.leftJoin("children.user", "childUser")
			.leftJoin("childUser.profile", "childUserProfile")
			.select([
				"comment.id", // always include primary key
				"comment.text",
				"comment.type",
				"comment.created_at",

				"user.id",
				"userProfile.first_name",
				"userProfile.last_name",
				"userProfile.profile_image",

				"children.id",
				"children.text",
				"children.type",
				"children.created_at",

				"childUser.id",
				"childUserProfile.first_name",
				"childUserProfile.last_name",
				"childUserProfile.profile_image",
			])
			.orderBy("comment.id", "DESC");

		// Return comments data with pagination
		return await paginate(
			paginationDto,
			this.commentRepository,
			queryBuilder,
			`${process.env.SERVER}/comment/${type}/${targetId}`
		);
	}

	async findAll(findAllCommentsDto: FindAllCommentsDto, paginationDto: PaginationDto) {

	}


	/**
	 * Retrieve a single comment by ID
	 * @param id - comment ID
	 */
	private async findOne(id: number) {
		// Retrieve comment by ID
		const comment = await this.commentRepository.findOneBy({ id });

		// Throw error if comment was not found
		if (!comment) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.CommentNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return comment;
	}

	/**
	 * Validate the target existence and return the correct required key and value
	 * @param targetId - The ID of blog or product
	 * @param type - The target's type (blog or product)
	 */
	private async targetValidation(targetId: number, type: CommentType): Promise<{ blogId: number } | { productId: number }> {
		if (type === CommentType.BLOG) {
			// Validate blog existence
			await this.blogService.validateExistence(targetId, BlogStatus.PUBLISHED)

			return { blogId: targetId }
		} else {
			// TODO: Validate product existence

			return { productId: targetId }
		}
	}

	/**
	 * Retrieve parent comment
	 * @param {number | undefined} parentId - The ID of the parent comment
	 * @param {CommentType} [type] - The type that the comment and its parent should belong to
	 * @returns {Promise<CommentEntity | null>} - The parent comment or null if not found
	 */
	private async parentValidation(parentId: number | undefined, type?: CommentType): Promise<CommentEntity | null> {
		// Return null if parent ID was invalid
		if (!parentId || (parentId && isNaN(parentId))) {
			return null;
		}

		// retrieve parent data
		const parent = await this.findOne(parentId);

		// Throw error if the parent is not from the same type as the category
		if (type && parent.type !== type) {
			throw new BadRequestException(
				this.i18n.t('locale.BadRequestMessages.InvalidParentCommentType', {
					lang: I18nContext?.current()?.lang,
				}),
			);
		}

		// Throw error if the parent comment is not a root comment
		if (parent.parentId) {
			throw new BadRequestException(
				this.i18n.t('locale.BadRequestMessages.InvalidParentComment', {
					lang: I18nContext?.current()?.lang,
				}),
			);
		}

		return parent
	}

	/**
	 * Retrieve user's data saved in request
	 */
	private getRequestUser() {
		// Retrieve user data from request
		let user = this.request.user;

		// Throw error if account not found
		if (!user) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.AccountNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return user;
	}
}
