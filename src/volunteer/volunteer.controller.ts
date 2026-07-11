import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VolunteerService } from './volunteer.service';
import { CreateVolunteerDto } from './volunteer.dto';
import { Volunteer } from './volunteer.entity';

@Controller('volunteer')
export class VolunteerController {
  constructor(private readonly volunteerService: VolunteerService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateVolunteerDto): Promise<Volunteer> {
    return this.volunteerService.createVolunteer(dto);
  }

  @Get('search')
  findByFullName(@Query('fullName') fullName: string): Promise<Volunteer[]> {
    return this.volunteerService.findByFullNameContains(fullName);
  }

  @Get(':username')
  findByUsername(@Param('username') username: string): Promise<Volunteer> {
    return this.volunteerService.findByUsername(username);
  }

  @Delete(':username')
  deleteByUsername(@Param('username') username: string): Promise<object> {
    return this.volunteerService.deleteByUsername(username);
  }
}
