import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Matches,
  MinLength,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

// =======================
// Signup DTO
// =======================

export class CreateVolunteerDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @Matches(/^[A-Za-z0-9._%+-]+@gmail.com$/, {
    message: 'Please enter a valid Gmail address',
  })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username!: string;

  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;

  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  phone!: string;

  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  city!: string;
}

// =======================
// Login DTO
// =======================

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

// =======================
// OTP DTO
// =======================

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Code must be a string' })
  @IsNotEmpty({ message: 'Code is required' })
  code!: string;
}

// =======================
// Profile Update DTO
// =======================

export class UpdateVolunteerDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

// =======================
// Availability DTO
// =======================

export class AvailabilityDto {
  @IsBoolean()
  isAvailable!: boolean;
}

// =======================
// Skill DTO
// =======================

export class SkillDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

// =======================
// Apply Volunteer Call DTO
// =======================

export class ApplyTaskDto {
  @IsInt({ message: 'Volunteer call id must be an integer' })
  @IsNotEmpty({ message: 'Volunteer call id is required' })
  volunteerCallId!: number;

  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  message!: string;
}

// =======================
// Work Log DTO
// =======================

export class WorkLogDto {
  @IsInt()
  assignmentId!: number;

  @IsInt()
  @Min(1)
  hours!: number;

  @IsString()
  @IsNotEmpty()
  note!: string;
}
