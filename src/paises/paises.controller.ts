import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaisesService } from './paises.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Controller('Paises')
export class PaisesController {

    constructor(
        private readonly countryService: PaisesService
    ) {}

    @Get()
    getAllPaises() {
        return this.countryService.findAll();
    }

    @Get(':id')
    getCountryById(@Param('id', ParseUUIDPipe) id: string) {
        return this.countryService.findByOneId(id); // también se puede usar Number(id)
        //return this.Paises.find(country => country.id === id);
    }

    @Post()
    createCountry(@Body() createCountryDto: CreateCountryDto) {
        return this.countryService.create(createCountryDto);
    }

    @Patch(':id')
    updateCountry(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCountryDto: UpdateCountryDto) {
        return this.countryService.update(id, updateCountryDto);
    }

    @Delete(':id')
    deleteCountry(@Param('id', ParseUUIDPipe) id: string) {
        return this.countryService.delete(id);
    }
};
