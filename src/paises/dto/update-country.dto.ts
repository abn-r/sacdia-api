import { Optional } from "@nestjs/common";
import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class UpdateCountryDto {
    
    @IsString()
    @IsUUID()
    @IsOptional()
    readonly id?: string; // Se coloca el signo de interrogación para que la validación sea opcional

    @IsString()
    @IsOptional()
    readonly name?: string;

    @IsString()
    @IsOptional()
    readonly code?: string;

    @IsString()
    @IsOptional()
    @MinLength(3, { message: 'Phone must be at least 3 characters long' })
    readonly phone?: string;

}