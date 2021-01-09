import { MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class LoginInput {
  @MinLength(3)
  @Field(() => String)
  username: string

  @MinLength(3)
  @Field(() => String)
  password: string
}

@InputType()
export class RegisterInput extends LoginInput {
  @MinLength(3)
  @Field(() => String)
  name: string
}