import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";

export const checkUser = async() => {
    const user = await currentUser();

    if(!user) {
        return null;
    }

    try {
        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id,
            }
        })

        if (loggedInUser) {
            return loggedInUser;
        }

        const name = `${user.firstName} ${user.lastName}`;

        const newUser = await db.user.create({
            data:{
                clerkUserId: user.id,
                name,
                imageUrl: user.imageUrl,
                email: user.emailAddresses[0].emailAddress
            }
        });

        return newUser;
    } catch (error) {
        // In production, you might want to use a proper logging service
        if (process.env.NODE_ENV === 'development') {
            console.error('Error in checkUser:', error.message);
        }
        return null;
    }
}