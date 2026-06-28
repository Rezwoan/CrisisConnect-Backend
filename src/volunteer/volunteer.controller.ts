import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { VolunteerService } from '../volunteer/volunteer.service';

@Controller('volunteer')
export class VolunteerController {
  constructor(
    private readonly volunteerService: VolunteerService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true })) // Add this
  register(@Body() dto: CreateUserDto) {
    return {
      message: 'Registration successful',
      data: dto,
    };
  }

  @Get('profile')
  getProfile() {
    return this.volunteerService.getProfile();
  }

  @Post('apply/:taskId')
  applyTask(
    @Param('taskId') taskId: string,
    @Body() body: any,
  ) {
    return this.volunteerService.applyTask(Number(taskId), body);
  }

  @Get('assignments')
  getAssignments() {
    return this.volunteerService.getAssignments();
  }

  @Get('badges')
  getBadges() {
    return this.volunteerService.getBadges();
  }

  @Get('search')
  searchVolunteer(
    @Query('city') city: string,
    @Query('skill') skill: string,
  ) {
    return this.volunteerService.searchVolunteer(city, skill);
  }
}
