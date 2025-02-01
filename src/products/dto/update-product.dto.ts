import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { isNumber, IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsNumber()
    @IsPositive()
    @Type(() => Number) 
    id: number;

    @IsString()
    name: string;

    @IsNumber({ maxDecimalPlaces: 4, })
    @Min(0)
    @Type(() => Number)
    price: number;
}
