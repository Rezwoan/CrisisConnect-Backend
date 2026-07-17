import { Injectable } from '@nestjs/common';

// Business logic for the Admin role (User Category 1). Replace this
// stub with real DB-backed logic as routes are added back.
@Injectable()
export class AdminService {
  getStatus(): string {
    return 'Admin module is working';
  }
}
