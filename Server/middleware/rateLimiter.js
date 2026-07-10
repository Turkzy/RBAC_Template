import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV === "development";

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: () => isDev, // Skip rate limiting in development
});

//Login rate limiter
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 5 login requests per windowMs
    message: {
        error: true,
        message: "Too many login attempts please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Skip successful requests (only count failed attempts)
    skip: () => isDev, // Skip rate limiting in development
});

//Registration rate limiter - stricter to prevent spam accounts
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 3 registration requests per hour
    message: {
        error: true,
        message: "Too many registration attempts. Please try again after 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev, // Skip rate limiting in development
});

//Sensitive account-management actions (create/update/delete) limiter
export const accountManagementLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 sensitive account actions per window
    message: {
        error: true,
        message: "Too many account management actions. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev, // Skip rate limiting in development
});

//Public concern submission rate limiter - prevent spam/abuse
export const concernSubmissionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 concern submissions per hour
    message: {
        error: true,
        message: "Too many concern submissions. Please try again after 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev, // Skip rate limiting in development
});