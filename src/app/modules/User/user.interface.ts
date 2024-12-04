import { Model } from "mongoose";

export interface IUser {
    username?: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    countryCode?: string;
    countryInitial?: string;
    address?: string;
    image_url?: string;
    is_staff?: boolean;
    is_superuser?: boolean;
};

export type TLogin = {
    email: string;
    password: string;
};

export interface UserModel extends Model<IUser> {

    isUserExistsByEmail(email: string): Promise<IUser>;

    isPasswordMatched(plainPassword: string, hashedPassword: string): Promise<boolean>;

};

