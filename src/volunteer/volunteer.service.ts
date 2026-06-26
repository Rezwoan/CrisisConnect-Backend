import { Injectable } from '@nestjs/common';

@Injectable()
export class VolunteerService {
  // Get Profile
  getProfile() {
    return {
      id: 1,
      name: 'Nirzor Das',
      city: 'Dhaka',
      availability: 'WEEKENDS',
      skills: ['IT', 'Logistics'],
    };
  }

  // Apply for a Task
  applyTask(taskId: number, body: any) {
    return {
      message: `Successfully applied for task ${taskId}`,
      applicationMessage: body.message,
    };
  }

  // Get Assignments
  getAssignments() {
    return [
      {
        taskId: 1,
        title: 'Food Distribution',
        status: 'IN_PROGRESS',
      },
      {
        taskId: 2,
        title: 'Medical Camp',
        status: 'PENDING',
      },
    ];
  }

  // Get Badges
  getBadges() {
    return [
      {
        name: 'First Deployment',
        earnedAt: '2026-06-22',
      },
      {
        name: '10 Hours Served',
        earnedAt: '2026-06-25',
      },
    ];
  }
  searchVolunteer(city: string, skill: string) {
  return {
    city,
    skill,
    message: `Searching volunteers from ${city} with ${skill} skill`,
  };
}
}