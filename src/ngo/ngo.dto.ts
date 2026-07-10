import {
    IsNotEmpty,
    IsString,
    Matches,
    IsDateString,
    IsUrl,
} from 'class-validator';

export class NgoDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^[^0-9]+$/, {
        message: 'Name should not contain any numbers',
    })
    name: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/[@#$&]/, {
        message:
            'Password must contain at least one special character (@ or # or $ or &)',
    })
    password: string;

    @IsNotEmpty()
    @IsDateString()
    date: string;

    @IsNotEmpty()
    @IsUrl(
        {},
        {
            message: 'Social media link must be a valid URL',
        },
    )
    socialMediaLink: string;
}
