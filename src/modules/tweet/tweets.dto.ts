import { Field, ID, InputType, ObjectType } from "type-graphql";
import { User } from "../user/user.dto";

@ObjectType()
export class Tweet {
  @Field(() => ID, { nullable: false })
  id: string;

  @Field(() => String, { nullable: false })
  body: string;

  @Field(() => String, { nullable: false })
  userId: string;

  @Field(() => User, { nullable: false })
  user: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateTweetInput {
  @Field({ nullable: false })
  body: string;

  userId: string;
}
