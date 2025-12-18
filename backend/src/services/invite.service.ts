import crypto from "crypto";
import { prisma } from "../prisma/client.js";

export async function generatInviteCode(): Promise<string> {
    let inviteCode = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
        inviteCode = crypto.randomBytes(8).toString("base64url").slice(0, 8);
        const existing = await prisma.invites.findUnique({
            where: { code: inviteCode }
        });
        if (!existing) isUnique = true;
        attempts++;
    }

    if (!isUnique) {
        throw new Error("Failed to generate unique invite code");
    }

    return inviteCode;
}