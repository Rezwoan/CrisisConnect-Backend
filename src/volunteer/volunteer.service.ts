import { Injectable } from '@nestjs/common';

// Business logic for the Volunteer role (User Category 3). Replace this
// stub with real DB-backed logic as routes are added back.
@Injectable()
export class VolunteerService {
  getStatus(): string {
    return 'Volunteer module is working';
  }
}
