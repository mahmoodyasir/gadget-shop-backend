import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import bcrypt from 'bcrypt';
import config from "../../config";
import { IUser, UserModel } from "./user.interface";

const userSchema = new Schema<IUser, UserModel>(
    {
        username: {
            type: String,
            unique: true,
            immutable: true,
            default: () => uuidv4(),
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        first_name: {
            type: String,
        },
        last_name: {
            type: String,
        },
        phone_number: {
            type: String,
        },
        countryCode: {
            type: String,
        },
        countryInitial: {
            type: String,
        },
        address: {
            type: String,
        },
        image_url: {
            type: String,
        },
        is_staff: {
            type: Boolean,
            default: false,
        },
        is_superuser: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.statics.isUserExistsByEmail = async function (email: string) {
    return await User.findOne({ email }).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
    plainPassword,
    hashedPassword,
) {
    return await bcrypt.compare(plainPassword, hashedPassword);
};


userSchema.pre('save', async function (next) {
    const user = this;
    user.password = await bcrypt.hash(user.password, Number(config.bcrypt_salt_rounds));
    next();
})

export const User = model<IUser, UserModel>('User', userSchema);