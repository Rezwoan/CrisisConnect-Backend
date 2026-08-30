// Body for PATCH /ngo/profile/active — one boolean, nothing else.
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateActiveStatusDto {
  @IsNotEmpty()
  @IsBoolean()
  isActive!: boolean;
}
