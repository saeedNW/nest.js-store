import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Put, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthDecorator } from 'src/common/decorator/auth.decorator';
import { PermissionDecorator } from 'src/common/decorator/permission.decorator';
import { Permissions } from 'src/common/enums/permissions.enum';
import { ApiConsumes, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/configs/swagger.config';
import { plainToClass } from 'class-transformer';
import { CategoryType } from './enum/category-type.enum';
import { PaginationDto } from 'src/common/utils/typeorm.pagination.utility';

@Controller('category')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) { }

	// ===================== Public APIs =====================

	/**
	 * Retrieves all categories in a hierarchical structure
	 *
	 * This method fetches the full tree structure of categories from the database using the
	 * category repository and returns it as a response
	 */
	@Get("/tree")
	@ApiOperation({ summary: "Retrieves all categories in a hierarchical structure" })
	findTree() {
		return this.categoryService.findTree();
	}

	/**
	 * Retrieve root categories by type and returns their descendant trees
	 * @param {CategoryType} type - The category type to filter categories by
	 * @returns
	 */
	@Get("/tree/:type")
	@ApiOperation({ summary: "Retrieve root categories by type and returns their descendant trees" })
	@ApiParam({ name: 'type', required: true, enum: CategoryType })
	findByType(@Param("type") type: CategoryType) {
		return this.categoryService.findByType(type);
	}

	/**
	 * Retrieve a single category by ID
	 * @param {number} id - Category ID
	 */
	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.categoryService.findOne(id);
	}

	// ===================== Admin APIs ======================

	/**
	 * Create new category
	 * @param {CreateCategoryDto} createCategoryDto - New category data
	 */
	@Post()
	@AuthDecorator()
	@PermissionDecorator(Permissions['Category.manager'])
	@ApiOperation({ summary: "[ RBAC ] - Create new category" })
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	create(@Body() createCategoryDto: CreateCategoryDto) {
		// filter client data and remove unwanted data
		createCategoryDto = plainToClass(CreateCategoryDto, createCategoryDto, {
			excludeExtraneousValues: true,
		});

		return this.categoryService.create(createCategoryDto);
	}

	/**
	 * Retrieve categories with pagination and the parent title
	 * @param {PaginationDto} paginationDto - Pagination data
	 */
	@Get()
	@AuthDecorator()
	@PermissionDecorator(Permissions['Category.manager'])
	@ApiOperation({ summary: "[ RBAC ] - Retrieve categories list" })
	findAll(@Query() paginationDto: PaginationDto) {
		return this.categoryService.findAll(paginationDto);
	}

	/**
	 * Updates an existing category with new details
	 * @param {number} id - The ID of the category to update
	 * @param {UpdateCategoryDto} updateCategoryDto - The new category details
	 */
	@Put(':id')
	@AuthDecorator()
	@PermissionDecorator(Permissions['Category.manager'])
	@ApiOperation({ summary: "[ RBAC ] - Update category" })
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
		// filter client data and remove unwanted data
		updateCategoryDto = plainToClass(UpdateCategoryDto, updateCategoryDto, {
			excludeExtraneousValues: true,
		});
		return this.categoryService.update(id, updateCategoryDto);
	}

	@Delete(':id')
	@AuthDecorator()
	@PermissionDecorator(Permissions['Category.manager'])
	@ApiOperation({ summary: "[ RBAC ] - Remove category" })
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.categoryService.remove(id);
	}
}
