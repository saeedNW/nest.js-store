/**
 * Converts a string or array of strings to an array of trimmed, unique strings.
 * @param {string[] | string | undefined} field - The input string, string array, or undefined.
 * @returns {string[] | undefined} - An array of trimmed, unique strings or undefined if input is falsy or invalid.
 */
export function stringToArray(
	field: string[] | string | undefined
): string[] | undefined {
	if (!field || field === "") return undefined;

	if (typeof field === "string") {
		return [...new Set(field.split(/[#,]/).map((item) => item.trim()).filter(Boolean))];
	}

	if (Array.isArray(field)) {
		return [...new Set(field.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean))];
	}

	return undefined;
}
