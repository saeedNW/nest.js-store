import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/guard/auth.guard";

/**
 * Create a custom decorator to combine multiply guard related decorator
 * in a single decorator in order to make the controller code cleaner and
 * easier to maintain.
 */
export function AuthDecorator() {
	return applyDecorators(UseGuards(AuthGuard), ApiBearerAuth("Authorization"));
}
