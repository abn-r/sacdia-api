import { Prisma } from "@prisma/client";

export class UsersClasses {
    user_class_id?: number;
    user_id: string;
    class_id: number;
    investiture?: boolean;
    date_investiture?: Date;
    active?: boolean;
    created_at?: Date;
    modified_at?: Date;
} 