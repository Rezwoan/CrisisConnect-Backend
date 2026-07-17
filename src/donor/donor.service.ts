import { Injectable } from '@nestjs/common';

// Business logic for the Donor role (User Category 4). Replace this
// stub with real DB-backed logic as routes are added back.
@Injectable()
export class DonorService {
  getStatus(): string {
    return 'Donor module is working';
  }
}
