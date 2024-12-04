import { z } from "zod";


const userValidationSchema = z.object({
    body: z.object({
        username: z.string().uuid().optional(),
        email: z.string().email({ message: "Invalid email address" }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" }),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        phone_number: z
            .string()
            .regex(/^\d{10,12}$/, { message: "Phone number must be 10 to 12 digits" })
            .or(z.literal(""))
            .optional(),

        countryCode: z
            .string()
            .regex(/^\+\d{1,4}$/, { message: "Invalid country code format" })
            .or(z.literal(""))
            .optional(),
        countryInitial: z
            .string()
            .regex(/^[A-Z]{2}$/, { message: "Country initial must be 2 uppercase letters" })
            .or(z.literal(""))
            .optional(),
        address: z.string().optional(),
        image_url: z.string().optional(),
        is_staff: z.boolean().optional().default(false),
        is_superuser: z.boolean().optional().default(false),
    })
});

const refreshTokenValidation = z.object({
    body: z.object({
        refresh: z.string(),
    })
});


const loginDataValidationSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    })
});

export const UserValidation = {
    userValidationSchema,
    refreshTokenValidation,
    loginDataValidationSchema,
};