/**
 * Replaces Persian and Arabic digits with their Latin equivalents
 * and removes commas from the number string.
 * @param {string | number} num - The number or string representation to be fixed
 * @returns {string | number} - The cleaned number as a string or number
 */
export function fixNumbers(num: string | number): string | number {
	if (typeof num !== 'string') return num;

	const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
	const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];

	for (let i = 0; i < 10; i++) {
		num = num.replace(persianNumbers[i], i.toString()).replace(arabicNumbers[i], i.toString());
	}

	return num;
}

/**
 * Recursively fixes Persian and Arabic numbers in an object or array.
 * @param {any} data - The object or array to be processed
 * @returns {any} - The modified data with numbers fixed
 */
export function fixDataNumbers<T>(data: T): T {
	// If the data is a string or number, fix its digits directly
	if (typeof data === 'string' || typeof data === 'number') {
		return fixNumbers(data) as T;
	}

	// If the data is an array, apply fixDataNumbers recursively to each element
	if (Array.isArray(data)) {
		return data.map((item) => fixDataNumbers(item)) as T;
	}

	// If the data is an object (excluding null), process each key-value pair
	if (typeof data === 'object' && data !== null) {
		return Object.keys(data).reduce((acc, key) => {
			// Recursively fix numbers in nested objects or arrays
			acc[key] = fixDataNumbers(data[key]);
			return acc;
		}, {} as any) as T;
	}

	return data;
}
