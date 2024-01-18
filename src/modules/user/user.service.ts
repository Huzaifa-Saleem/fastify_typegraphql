import { Prisma } from "../../utils/prisma";
import { RegisterUserInput, LoginUserInput } from "./user.dto";
import argon2 from "argon2";

export const userService = {
  /**
   *
   * @param input
   * @returns
   */
  async createUser(input: RegisterUserInput) {
    const password = await argon2.hash(input.password);

    return await Prisma.user.create({
      data: {
        ...input,
        email: input.email.toLowerCase(),
        username: input.username.toLowerCase(),
        password,
      },
    });
  },

  /**
   *
   * @param id
   * @returns
   */
  async findUserById(id: string) {
    return await Prisma.user.findUnique({
      where: { id },
      include: {
        followedBy: true,
        following: true,
      },
    });
  },

  /**
   *
   * @param input
   * @returns
   */
  async findUserByEmailOrUsername(input: LoginUserInput["username_or_email"]) {
    return await Prisma.user.findFirst({
      where: {
        OR: [{ username: input }, { email: input }],
      },
    });
  },

  /**
   *
   * @param userId
   * @param followerId
   * @returns
   */
  async followUser(userId: string, followerId: string) {
    return await Prisma.user.update({
      where: { id: userId },
      data: {
        following: {
          connect: {
            id: followerId,
          },
        },
      },
    });
  },

  /**
   *
   * @param userId
   * @param followerId
   * @returns
   */
  async unfollowUser(userId: string, followerId: string) {
    return await Prisma.user.update({
      where: { id: userId },
      data: {
        following: {
          disconnect: {
            id: followerId,
          },
        },
      },
    });
  },

  /**
   *
   * @returns
   */
  async getAllUsers() {
    return await Prisma.user.findMany();
  },

  // async findUserByUsername(username: string) {
  //     return await prisma.user.findUnique({ where: { username } });
  // },
  // async updateUser(id: string, data: Prisma.UserUpdateInput) {
  //     return await prisma.user.update({ where: { id }, data });
  // },
  // async deleteUser(id: string) {
  //     return await prisma.user.delete({ where: { id } });
  // },

  async verifyPassword({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }) {
    return await argon2.verify(hashedPassword, password);
  },
};
