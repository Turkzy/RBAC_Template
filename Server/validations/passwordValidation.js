import { body, validationResult } from "express-validator";

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
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')

    .matches(/[A-Z]/)
    .withMessage('password must contain at least one uppercase letter')

    .matches(/[a-z]/)
    .withMessage('password must contain at least one lowercase letter')
    
    .matches(/[0-9]/)
    .withMessage("password must contain at least one number")

    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("password must contain at least one special character"),
];