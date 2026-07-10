import { Injectable } from '@nestjs/common';
import { ApplyTaskDto, VolunteerDto } from './volunteer.dto';

@Injectable()
export class VolunteerService {
  private readonly dummyAssignments = [
    { taskId: 1, title: 'Food Distribution', status: 'IN_PROGRESS' },
    { taskId: 2, title: 'Medical Camp', status: 'PENDING' },
  ];

  private readonly dummyBadges = [
    { name: 'First Deployment', earnedAt: '2026-06-22' },
    { name: '10 Hours Served', earnedAt: '2026-06-25' },
  ];

  registerVolunteer(dto: VolunteerDto): object {
    return {
      message: 'Volunteer registered successfully',
      data: dto,
    };
  }

  getProfile(): object {
    return {
      id: 1,
      name: 'Nirzor Das',
      city: 'Dhaka',
      availability: 'WEEKENDS',
      skills: ['IT', 'Logistics'],
    };
  }

  applyTask(taskId: number, body: ApplyTaskDto): object {
    return {
      message: `Successfully applied for task ${taskId}`,
      applicationMessage: body.message,
    };
  }

  getAssignments(): object {
    return this.dummyAssignments;
  }

  getBadges(): object {
    return this.dummyBadges;
  }

  searchVolunteer(city?: string, skill?: string): object {
    return {
      message: `Searching volunteers from ${city} with ${skill} skill`,
      city,
      skill,
    };
  }
}
