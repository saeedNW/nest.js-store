/**
 * Removes invalid or undesired properties from an object based on specified criteria.
 * @param {Record<string, any>} data - The object from which to delete properties.
 * @param {string[]} blackListFields - List of fields to be removed from the object.
 * @param {string[]} nullableFields - Fields that are allowed to be nullish or empty.
 * @returns {void} Modifies the input object directly.
 */
export function deleteInvalidPropertyInObject(
	data: Record<string, any> = {},
	blackListFields: string[] = [],
	nullableFields: string[] = []
): void {
	// List of nullish data that should be removed from the object
	const nullishData: (string | number | null | undefined)[] = [
		"",
		" ",
		"0",
		0,
		null,
		undefined,
	];

	// Iterate over the object properties
	Object.keys(data).forEach((key) => {
		// Remove property if it is in the blacklist
		if (blackListFields.includes(key)) {
			delete data[key];
		}

		// Remove property if it is an empty array and not allowed to be nullable
		if (
			Array.isArray(data[key]) &&
			data[key].length === 0 &&
			!nullableFields.includes(key)
		) {
			delete data[key];
		}

		// Remove property if it is nullish or invalid and not allowed to be nullable
		if (nullishData.includes(data[key]) && !nullableFields.includes(key)) {
			delete data[key];
		}

		// If property is a nested object, check its properties
		if (typeof data[key] === "object" && data[key] !== null) {
			Object.keys(data[key]).forEach((prop) => {
				// Remove nested property if it is in the blacklist
				if (blackListFields.includes(prop)) {
					delete data[key][prop];
				}

				// Remove nested property if it is nullish or invalid and not allowed to be nullable
				if (
					nullishData.includes(data[key][prop]) &&
					!nullableFields.includes(prop)
				) {
					delete data[key][prop];
				}
			});

			// Remove the nested object if it is empty and not allowed to be nullable
			if (
				Object.keys(data[key]).length === 0 &&
				!nullableFields.includes(key)
			) {
				delete data[key];
			}
		}
	});
}

/**
 * Convert a string to a valid blog slug
 * @param {string} str - string that should be converted to slug
 * @returns {string} created slug
 */
export const createSlug = (str: string): string => {
	// Remove all non-word characters and replace spaces with hyphens
	return str
		.replace(/[،ًًًٌٍُِ\.\+\-_)(*&^%$#@!~'";:?><«»`ء]+/g, "")
		?.replace(/[\s]+/g, "-");
};

/**
 * Create and return a random number
 * @returns {string} - A random number
 */
export const randomId = (): string => Math.random().toString(36).substring(2);

/**
 * Convert string boolean to a valid boolean
 * @param value - The value which should be converted to boolean
 */
export function toBoolean(value: any): boolean | any {
	if ([true, "true"].includes(value)) return true;
	if ([false, "false"].includes(value)) return false;
	return value;
}
