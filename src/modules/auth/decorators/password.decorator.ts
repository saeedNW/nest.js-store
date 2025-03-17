import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationOptions,
	registerDecorator,
} from "class-validator";

/**
 * Custom validation decorator to check if the confirmed password matches the original password.
 *
 * @param {string} property - The name of the original password field.
 * @param {string | ((args: ValidationArguments) => string)} [message] - Custom error message as a string or function.
 * @param {ValidationOptions} [validationOptions] - Additional validation options.
 * @returns {Function} - A decorator function.
 */
export function ConfirmedPassword(
	property: string,
	message?: string | ((args: ValidationArguments) => string),
	validationOptions?: ValidationOptions
): Function {
	return (object: Record<string, any>, propertyName: string) => {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [property, message],
			validator: ConfirmedPasswordConstraint,
		});
	};
}

/**
 * Validator constraint to check if the confirmed password matches the original password.
 */
@ValidatorConstraint({ name: "ConfirmedPassword", async: false })
export class ConfirmedPasswordConstraint
	implements ValidatorConstraintInterface {
	/**
	 * Validation function to check if the confirmed password matches the original password.
	 *
	 * @param {any} value - The value of the confirm password field.
	 * @param {ValidationArguments} args - Validation arguments containing metadata.
	 * @returns {boolean} - Returns true if passwords match, otherwise false.
	 */
	validate(value: any, args: ValidationArguments): boolean {
		const { object, constraints } = args;
		const [passwordField] = constraints;
		const originalPassword = object[passwordField];

		return value === originalPassword;
	}

	/**
	 * Default error message for validation failure.
	 *
	 * @param {ValidationArguments} args - Validation arguments containing metadata.
	 * @returns {string} - The error message, either a static string or a computed function result.
	 */
	defaultMessage(args: ValidationArguments): string {
		const customMessage = args.constraints[1]; // Custom message if provided

		// If message is a function, call it with validation arguments
		if (typeof customMessage === "function") {
			return customMessage(args);
		}

		// Otherwise, return the static message or a default message
		return customMessage ?? "Password and Confirm Password must match.";
	}
}


//? Usage Example:
/**
 @ApiProperty()
	@IsString()
	@IsNotEmpty({
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.EmptyPassword'))
		},
	})
	@Expose()
	password: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty({
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.EmptyConfirmPassword'))
		},
	})
	@ConfirmedPassword("password", (args) =>
		String(I18nContext.current()?.t('locale.ValidationMessages.PasswordMismatch'))
	)
	@Expose()
	confirmPassword: string;
 */
