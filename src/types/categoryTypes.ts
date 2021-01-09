import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class CategoryTotalPages {
  @Field(() => String)
  title: string

  @Field(() => Number)
  total_pages: number
}