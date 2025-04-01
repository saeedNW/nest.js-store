import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { escapeAndTrim } from 'src/common/utils/sanitizer.utility';
import { deleteInvalidPropertyInObject } from 'src/common/utils/functions.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { IsNull, Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { CategoryType } from './enum/category-type.enum';
import { paginate, PaginatedResult, PaginationDto } from 'src/common/utils/typeorm.pagination.utility';

@Injectable()
export class CategoryService {
	constructor(
		// inject category repository
		@InjectRepository(CategoryEntity)
		private categoryRepository: Repository<CategoryEntity>,
		// Register i18n service
		private readonly i18n: I18nService
	) { }

	/**
	 * Create new category
	 * @param createCategoryDto - New category data
	 */
	async create(createCategoryDto: CreateCategoryDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(createCategoryDto);
		escapeAndTrim(createCategoryDto);

		// Validate title duplication
		await this.duplicatedTitle(createCategoryDto.title);

		// Parent validation
		let parent = await this.parentValidation(createCategoryDto.parentId, createCategoryDto.type);

		// Insert category into the database
		const newCategory = this.categoryRepository.create({ ...createCategoryDto, parent: parent || undefined });
		await this.categoryRepository.save(newCategory);

		return this.i18n.t('locale.PublicMessages.SuccessCreate', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 * Retrieve categories with pagination and the parent title
	 * @param {PaginationDto} paginationDto - Pagination data
	 * @returns {Promise<PaginatedResult<CategoryEntity>>} - Return categories list with pagination
	 */
	async findAll(
		paginationDto: PaginationDto
	): Promise<PaginatedResult<CategoryEntity>> {
		// Create find process query builder
		const queryBuilder = this.categoryRepository
			.createQueryBuilder("category")
			.leftJoin("category.parent", "parent")
			.addSelect(["parent.title"]);

		// Return categories data with pagination
		return await paginate(
			paginationDto,
			this.categoryRepository,
			queryBuilder,
			process.env.SERVER_LINK + "/category"
		);
	}

	/**
	 * Retrieves all categories in a hierarchical structure
	 *
	 * This method fetches the full tree structure of categories from the database using the
	 * category repository and returns it as a response
	 */
	async findTree() {
		// Get the tree repository and retrieve all category trees
		const treeRepository = this.categoryRepository.manager.getTreeRepository(CategoryEntity);
		// Fetch full hierarchical data
		const categories = await treeRepository.findTrees();

		return { categories };
	}

	/**
	 * Retrieve root categories by type and returns their descendant trees
	 * @param {CategoryType} type - The category type to filter categories by
	 * @returns
	 */
	async findByType(type: CategoryType) {
		// Get the tree repository to fetch hierarchical category data
		const treeRepository = this.categoryRepository.manager.getTreeRepository(CategoryEntity);

		// Retrieve root categories that match the specified type
		const categories = await this.categoryRepository.find({
			where: { type: type, parent: IsNull() }, // 'parent' is null, meaning these are root categories
		});

		// For each root category, retrieve the entire descendant tree
		const categoryTrees = await Promise.all(
			categories.map(async (category) => {
				// Retrieve and return the descendants tree for the current category
				return await treeRepository.findDescendantsTree(category);
			})
		);

		return { categories: categoryTrees };
	}


	/**
	 * Retrieve a single category by ID
	 * @param id - Category ID
	 */
	async findOne(id: number) {
		// Retrieve category by ID
		const category = await this.categoryRepository.findOneBy({ id });

		// Throw error if category was not found
		if (!category) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.CategoryNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return category;
	}

	/**
	 * Updates an existing category with new details
	 * @param {number} id - The ID of the category to update
	 * @param {UpdateCategoryDto} updateCategoryDto - The new category details
	 */
	async update(id: number, updateCategoryDto: UpdateCategoryDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(updateCategoryDto, [], ['parentId']);
		escapeAndTrim(updateCategoryDto);

		// Verify category existence
		const category = await this.findOne(id);

		// Validate title duplication
		if (updateCategoryDto.title) {
			await this.duplicatedTitle(updateCategoryDto.title, id);
		}

		// Parent validation
		let parent = await this.parentValidation(updateCategoryDto.parentId, updateCategoryDto.type);

		// Apply updates
		Object.assign(category, {
			title: updateCategoryDto.title || category.title,
			type: updateCategoryDto.type || category.type,
			parent
		});

		// Save new data
		await this.categoryRepository.save(category);

		return this.i18n.t('locale.PublicMessages.SuccessUpdate', {
			lang: I18nContext?.current()?.lang
		});
	}

	async remove(id: number) {
		// Verify category existence
		const category = await this.findOne(id);

		// remove category
		await this.categoryRepository.delete({ id });

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
			lang: I18nContext?.current()?.lang
		})
	}

	/**
	 * Check if the category title is duplicated
	 * @param {string} title - The title of the category to check
	 * @param {number} [id] - Category ID
	 */
	private async duplicatedTitle(title: string, id?: number) {
		const category = await this.categoryRepository.findOne({ where: { title } })
		if (category && category.id !== id) {
			throw new ConflictException(
				this.i18n.t('locale.ConflictMessages.ConflictCategory', {
					lang: I18nContext?.current()?.lang,
				}),
			);
		}
	}

	/**
	 * Retrieve parent category
	 * @param {number | undefined} parentId - The ID of the parent category
	 * @param {CategoryType} [type] - The type that the category and its parent should belong to
	 * @returns {Promise<CategoryEntity | null>} - The parent category or null if not found
	 */
	private async parentValidation(parentId: number | undefined, type?: CategoryType): Promise<CategoryEntity | null> {
		// Return null if parent ID was invalid
		if (!parentId || (parentId && isNaN(parentId))) {
			return null;
		}

		// retrieve parent data
		const parent = await this.findOne(parentId);

		// Throw error if the parent is not from the same type as the category
		if (type && parent.type !== type) {
			throw new BadRequestException(
				this.i18n.t('locale.BadRequestMessages.InvalidParentType', {
					lang: I18nContext?.current()?.lang,
				}),
			);
		}

		return parent
	}
}
