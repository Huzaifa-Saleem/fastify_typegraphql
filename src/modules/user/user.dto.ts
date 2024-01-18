import { IsEmail, Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID, { nullable: true })
  id: string;

  @Field(() => ID, { nullable: true })
  username: string;

  @Field(() => ID, { nullable: true })
  email: string;

  @Field(() => ID, { nullable: true })
  password: string;
}

@InputType()
export class RegisterUserInput {
  @Field({ nullable: false })
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(8, 30)
  password: string;
}

@InputType()
export class LoginUserInput {
  @Field({ nullable: false })
  username_or_email: string;

  @Field()
  @Length(8, 30)
  password: string;
}

@ObjectType()
export class UserFollowers {
  @Field()
  count: number;

  @Field(() => [User])
  items: User[];
}

@InputType()
export class FollowUserInput {
  @Field()
  userId: string;
}
