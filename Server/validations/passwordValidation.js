import { body, validationResult } from "express-validator";

export const isStrongPassword = (password) => {
    if (typeof password !== "string") return false;

    return password.length >= 8
        && /[A-Z]/.test(password)
        && /[a-z]/.test(password)
        && /[0-9]/.test(password)
        && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
};

export const passwordValidationRules = [
    body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    
    .matches(/[A-Z]/)
    .withMessage('password must contain at least one uppercase letter')

    .matches(/[a-z]/)
    .withMessage('password must contain at least one lowercase letter')

    .matches(/[0-9]/)
    .withMessage("password must contain at least one number")

    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("password must contain at least one special character")

    .not()
    .isEmpty()
    .withMessage("password is required"),
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: true,
            message: "Validation failed",
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

export const optionalPasswordValidationRules = [
    body('password')

    .optional()
    .custom((value) => {
        if (value === undefined || value === null || value === "") return true;
        if (!isStrongPassword(value)) {
            throw new Error('Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character');
        }
        return true;
    }),
];