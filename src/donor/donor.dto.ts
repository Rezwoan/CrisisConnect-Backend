import { Matches, MinLength } from "class-validator";

export class DonorDTO {

    @Matches(/^[a-zA-Z\s]+$/,{message:'invalid name'})
    Name : string = '';

    @MinLength(6)
    @Matches(/[a-z]/,{message:'Password must contain one lowercase letter'})
    Password : string = '';

    @Matches(/^01/,{message:'Number must start with 01'})
    Phone : string = '';
}