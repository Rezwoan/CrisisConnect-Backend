import {
  Controller,
  Get,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { VolunteerService } from '../volunteer/volunteer.service';

@Controller('volunteers')
export class VolunteerController {
  constructor(
    private readonly volunteerService: VolunteerService,
  ) {}

  // GET /volunteers/profile
  @Get('profile')
  getProfile() {
    return this.volunteerService.getProfile();
  }

  // POST /volunteers/apply/1
  @Post('apply/:taskId')
  applyTask(
    @Param('taskId') taskId: string,
    @Body() body: any,
  ) {
    return this.volunteerService.applyTask(
      Number(taskId),
      body,
    );
  }

  // GET /volunteers/assignments
  @Get('assignments')
  getAssignments() {
    return this.volunteerService.getAssignments();
  }

  // GET /volunteers/badges
  @Get('badges')
  getBadges() {
    return this.volunteerService.getBadges();
  }
}