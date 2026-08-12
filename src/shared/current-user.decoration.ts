import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../generated/prisma/client";
import { CurrentUserType } from "../auth/auth.types";

export const CurrentUser = createParamDecorator(
    (data: keyof CurrentUserType, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;
        return data ? user[data] : user;
    }
)