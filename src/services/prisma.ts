import { PrismaClient, User } from "../generated/prisma";

const prisma = new PrismaClient();
export default prisma;

export {
    // Export models
    User as UserModel,
};
