import { Prisma } from "@prisma/client";

export class Countries implements Prisma.countriesCreateInput {
    name: string;
    abbreviation: string;
}