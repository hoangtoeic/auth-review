import { createParamDecorator, Req } from "@nestjs/common";
import { User } from "src/db/entities/user.entity";

export const getUser = createParamDecorator((data, req): User => 
  {return req.user}
)