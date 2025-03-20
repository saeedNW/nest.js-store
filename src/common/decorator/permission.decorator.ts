import { SetMetadata } from "@nestjs/common"
import { Permissions } from "../enums/permissions.enum"

export const PERMISSION_KEY = "PERMISSION"
export const PermissionDecorator = (...permissions: Permissions[]) => SetMetadata(PERMISSION_KEY, permissions)
