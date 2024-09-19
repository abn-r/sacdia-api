import { IsString, isString, MinLength } from "class-validator";

export class CreateCountryDto {
    @IsString()
    readonly name: string;

    @IsString()
    readonly code: string;

    @IsString()
    @MinLength(3, { message: 'Phone must be at least 3 characters long' })
    readonly phone: string;

}