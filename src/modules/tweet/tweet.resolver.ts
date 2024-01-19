import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { Context } from "../../utils/createServer";
import { CreateTweetInput, Tweet } from "./tweets.dto";
import { TweetService } from "./tweet.service";
import { userService } from "../user/user.service";

@Resolver(Tweet)
export class TweetResolver {
  @Authorized()
  @Mutation(() => Tweet)
  async createTweet(
    @Arg("input") input: CreateTweetInput,
    @Ctx() context: Context,
    @PubSub() pubSub: PubSubEngine
  ) {
    const result = await TweetService.createTweet({
      ...input,
      userId: context.user?.id!,
    });

    await pubSub.publish("NEW_MESSAGE", result);

    return result;
  }

  @Query(() => [Tweet])
  async getAllTweets() {
    return await TweetService.getAllTweets();
  }

  @Subscription(() => Tweet, { topics: "NEW_MESSAGE" })
  async newTweet(@Root() tweet: Tweet) {
    return await tweet;
  }

  @FieldResolver()
  async user(@Root() tweet: Tweet) {
    return await userService.findUserById(tweet.userId);
  }
}
