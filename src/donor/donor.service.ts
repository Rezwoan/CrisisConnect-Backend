import { Injectable } from '@nestjs/common';
import { DonorDTO } from './donor.dto';

@Injectable()
export class DonorService {
  private readonly dummyCrises = [
    {
      id: 1,
      title: 'Flood Relief - Sylhet',
      type: 'flood',
      city: 'Sylhet',
      fundsNeeded: 100000,
      fulfilled: 65000,
    },
    {
      id: 2,
      title: "Cyclone Recovery - Cox's Bazar",
      type: 'cyclone',
      city: "Cox's Bazar",
      fundsNeeded: 50000,
      fulfilled: 12000,
    },
  ];

  private readonly dummyDonations = [
    {
      id: 1,
      crisisName: 'Flood Relief - Sylhet',
      amount: 5000,
      status: 'received',
    },
    {
      id: 2,
      crisisName: "Cyclone Recovery - Cox's Bazar",
      amount: 2000,
      status: 'pledged',
    },
  ];

  getCrises(type?: string, city?: string): object {
    let crises = [...this.dummyCrises];

    if (type) {
      crises = crises.filter(
        (crisis) => crisis.type.toLowerCase() === type.toLowerCase(),
      );
    }

    if (city) {
      crises = crises.filter(
        (crisis) => crisis.city.toLowerCase() === city.toLowerCase(),
      );
    }

    return {
      message:
        crises.length > 0
          ? 'Successfully retrieved crises list'
          : 'No crises found',
      count: crises.length,
      data: crises,
    };
  }

  getCrisisById(id: number): object {
    const crisis = this.dummyCrises.find((crisis) => crisis.id === id) || null;

    return {
      message: crisis
        ? `Successfully retrieved crisis with ID: ${id}`
        : `No crisis found with ID: ${id}`,
      data: crisis,
    };
  }

  getMyDonations(status?: string): object {
    let donations = [...this.dummyDonations];

    if (status) {
      donations = donations.filter(
        (donation) => donation.status.toLowerCase() === status.toLowerCase(),
      );
    }

    return {
      message:
        donations.length > 0
          ? 'Successfully retrieved donation history'
          : 'No donations found',
      count: donations.length,
      data: donations,
    };
  }

  getDonationById(id: number): object {
    const donation =
      this.dummyDonations.find((donation) => donation.id == id) || null;

    return {
      message: donation
        ? `Successfully retrieved donation with ID: ${id}`
        : `No donation found with ID: ${id}`,
      data: donation,
    };
  }

  insertDonor(donorData: DonorDTO): object {
    donorData.name = donorData.name.trim();
    donorData.password = donorData.password.trim();
    donorData.phone = donorData.phone.trim();

    return {
      message: 'Donor inserted successfully',
      data: donorData,
    };
  }
}
