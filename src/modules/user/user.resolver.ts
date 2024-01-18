import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import {
  FollowUserInput,
  LoginUserInput,
  RegisterUserInput,
  User,
  UserFollowers,
} from "./user.dto";
import { userService } from "./user.service";
import { Context } from "../../utils/createServer";
import { ApolloError } from "apollo-server-core";

//
@Resolver(() => User)
class UserResolver {
  /**
   *
   * @param input
   * @returns
   */
  @Mutation(() => User)
  async register(@Arg("input") input: RegisterUserInput) {
    try {
      return await userService.createUser(input);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param input
   * @param context
   * @returns
   */
  @Mutation(() => String)
  async login(@Arg("input") input: LoginUserInput, @Ctx() context: Context) {
    const user = await userService.findUserByEmailOrUsername(
      input["username_or_email"].toLowerCase()
    );

    if (!user) throw new ApolloError("User doesnt exist!");

    const isValid = await userService.verifyPassword({
      password: input?.password,
      hashedPassword: user?.password,
    });

    if (!isValid) throw new ApolloError("Invalid Credentials!");

    const token = await context.reply?.jwtSign({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    if (!token) {
      throw new ApolloError("Error signing token");
    }

    context.reply?.setCookie("token", token, {
      domain: "localhost",
      path: "/",
      secure: false,
      httpOnly: true,
      sameSite: false,
    });

    return token;
  }

  /**
   *
   * @param input
   * @param context
   * @returns
   */
  @Authorized()
  @Mutation(() => User)
  async followUser(
    @Arg("input") input: FollowUserInput,
    @Ctx() context: Context
  ) {
    try {
      const user = await userService.findUserById(input.userId);

      if (!user) throw new ApolloError("User doesnt exist!");

      if (user.id === context.user?.id)
        throw new ApolloError("You cant follow yourself!");

      return await userService.followUser(context.user?.id!, user.id);
    } catch (error: any) {
      throw new ApolloError(error);
    }
  }

  /**
   *
   * @param context
   * @param FollowerId
   * @returns
   */
  @Authorized()
  @Mutation(() => Boolean)
  async unfollowUser(
    @Ctx() context: Context,
    @Arg("FollowerId") FollowerId: string
  ) {
    try {
      const user = await userService.findUserById(context.user?.id!);

      if (user?.following?.some((user) => user.id === FollowerId))
        throw new ApolloError("You are not following this user!");

      await userService.unfollowUser(context.user?.id!, FollowerId);

      return true;
    } catch (error: any) {
      throw new ApolloError(error);
    }
  }

  /**
   *
   * @returns
   */
  @Query(() => [User])
  async getAllUsers() {
    return await userService.getAllUsers();
  }

  /**
   *
   * @param ctx
   * @returns
   */
  @Query(() => User)
  @Authorized()
  me(@Ctx() ctx: Context) {
    return ctx.user;
  }

  /**
   *
   * @returns
   */
  @Authorized()
  @FieldResolver(() => UserFollowers)
  async followers(@Ctx() ctx: Context) {
    try {
      const user = await userService.findUserById(ctx.user?.id!);

      if (!user) throw new ApolloError("User doesnt exist!");

      return {
        count: user?.followedBy?.length,
        items: user?.followedBy,
      };
    } catch (error: any) {
      throw new ApolloError(error);
    }
  }

  /**
   *
   * @returns
   */
  @Authorized()
  @FieldResolver(() => UserFollowers)
  async following(@Ctx() ctx: Context) {
    try {
      const user = await userService.findUserById(ctx.user?.id!);

      if (!user) throw new ApolloError("User doesnt exist!");

      return {
        count: user?.following?.length,
        items: user?.following,
      };
    } catch (error: any) {
      throw new ApolloError(error);
    }
  }
}

export default UserResolver;
