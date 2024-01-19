import { Prisma } from "../../utils/prisma";

export const TweetService = {
  async createTweet({ body, userId }: { body: string; userId: string }) {
    return await Prisma.tweets.create({
      data: {
        body,
        userId,
      },
      include: {
        user: true,
      },
    });
  },

  async getAllTweets() {
    return await Prisma.tweets.findMany();
  },
};
