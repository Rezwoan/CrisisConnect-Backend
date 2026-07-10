import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VolunteerService } from './volunteer.service';
import { ApplyTaskDto, VolunteerDto } from './volunteer.dto';

@Controller('volunteer')
export class VolunteerController {
  constructor(private readonly volunteerService: VolunteerService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  register(@Body() dto: VolunteerDto): object {
    return this.volunteerService.registerVolunteer(dto);
  }

  @Get('profile')
  getProfile(): object {
    return this.volunteerService.getProfile();
  }

  @Post('apply/:taskId')
  applyTask(
    @Param('taskId') taskId: string,
    @Body() body: ApplyTaskDto,
  ): object {
    return this.volunteerService.applyTask(Number(taskId), body);
  }

  @Get('assignments')
  getAssignments(): object {
    return this.volunteerService.getAssignments();
  }

  @Get('badges')
  getBadges(): object {
    return this.volunteerService.getBadges();
  }

  @Get('search')
  searchVolunteer(
    @Query('city') city?: string,
    @Query('skill') skill?: string,
  ): object {
    return this.volunteerService.searchVolunteer(city, skill);
  }
}
