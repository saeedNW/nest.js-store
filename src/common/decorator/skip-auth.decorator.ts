import { SetMetadata } from '@nestjs/common';

/**
 * Create a custom decorator which will set a value of true in request's metadata,
 * that will be used in order to bypass authorization on the routes that can be
 * accessible without authorization
 */
export const SKIP_AUTH: string = 'SKIP_AUTH';
export const SkipAuth = () => SetMetadata(SKIP_AUTH, true);
