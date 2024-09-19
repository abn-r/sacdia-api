import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid'
import { Country } from './interfaces/paises.interface';
import { CreateCountryDto, UpdateCountryDto } from './dto';


@Injectable()
export class PaisesService {
    private Paises: Country[] = [
        {
            "id": uuid(),
            "name": "Afghanistan",
            "code": "AF",
            "phone": "93"
        },
        {
            "id": uuid(),
            "name": "Albania",
            "code": "AL",
            "phone": "355"
        },
        {
            "id": uuid(),
            "name": "Algeria",
            "code": "DZ",
            "phone": "213"
        },
        {
            "id": uuid(),
            "name": "American Samoa",
            "code": "AS",
            "phone": "1684"
        },
        {
            "id": uuid(),
            "name": "Andorra",
            "code": "AD",
            "phone": "376"
        },
        {
            "id": uuid(),
            "name": "Angola",
            "code": "AO",
            "phone": "244"
        },
        {
            "id": uuid(),
            "name": "Anguilla",
            "code": "AI",
            "phone": "1264"
        }
    ]

    findAll() {
        return this.Paises;
    }

    findByOneId(id: string) {
        const country = this.Paises.find(country => country.id === id);

        if (!country) throw new NotFoundException(`Country not found`); // NotFoundException es una clase de error

        return country;
    }

    create(createCountryDto: CreateCountryDto) {
        const country: Country = {
            id: uuid(),
            ...createCountryDto, // esta línea es lo mismo que hacer lo de abajo
            //name: createCountryDto.name,
            //code: createCountryDto.code,
            //phone: createCountryDto.phone
        };
        this.Paises.push(country);

        return country;
    }

    update(id: string, updateCountryDto: UpdateCountryDto) {

        let countryDb = this.findByOneId(id);

        // Si el id no es el mismo que el que se está actualizando
        if (updateCountryDto.id && updateCountryDto.id !== id)
            throw new BadRequestException(`The ID you are trying to update is not the same as the one you are sending`);


        this.Paises = this.Paises.map(country => {
            if (country.id === id) {
                countryDb = {
                    ...countryDb,
                    ...updateCountryDto,
                    id, //En caso de envíar un id diferente al que se está actualizando, se coloca el id original
                }
                return countryDb
            }
            return country;
        });

        return countryDb;
    }

    delete(id: string) {
        let country = this.findByOneId(id);

        this.Paises = this.Paises.filter(country => country.id !== id);
        
    }
}
