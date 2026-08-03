import { VolunteerService } from './volunteer.service';

describe('VolunteerService', () => {
  it('returns a healthy status message', () => {
    const service = new VolunteerService();

    expect(service.getStatus()).toBe('Volunteer module is working');
  });
});
