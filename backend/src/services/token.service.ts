import jwt from "jsonwebtoken";
import crypto from "crypto";


export function generateJwtAccessToken(userId: string): string {
    const payload = { userId};
    const secret = process.env.JWT_SECRET;
    const options: jwt.SignOptions = { expiresIn: '1h'};

    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jwt.sign(payload, secret, options)
}



export function generateJwtRefreshToken(userId: string): {
	refreshToken: string;
	jti: string;
    expiresAt: Date;
} {
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		throw new Error("JWT_SECRET is not defined");
	}

	// unique session identifier
	const jti = crypto.randomUUID();

	const refreshToken = jwt.sign(
		{}, // no custom data
		secret,
		{
			subject: userId,   // standard JWT claim
			jwtid: jti,        // session id
			expiresIn: "30d",
		}
	);
    const expiresAt: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

	return { refreshToken , jti,  expiresAt};
}
