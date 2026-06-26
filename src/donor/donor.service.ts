import { Injectable } from '@nestjs/common';

@Injectable()
export class DonorService {
    getCrises(type: string, city: string): object {
    return {
      message: "Crises fetched successfully",
      data: [
        { id: 1, title: "Flood Relief - Sylhet", fundsNeeded: 100000, fulfilled: 65000 },
        { id: 2, title: "Cyclone Recovery - Cox's Bazar", fundsNeeded: 50000, fulfilled: 12000 }
      ]
    }
  }

  getCrisisById(id: number): object {
    return {
      message: "Crisis fetched successfully",
      data: {
        id: id,
        title: "Flood Relief - Sylhet",
        fundsNeeded: 100000,
        fulfilled: 65000,
        resourceRequests: [
          { item: "Clean Water", quantityNeeded: 500 },
          { item: "Cash Donation", quantityNeeded: 35000 }
        ]
      }
    }
  }

  getMyDonations(status: string): object {
    return {
      message: "Donation history fetched successfully",
      data: [
        { id: 1, crisisName: "Flood Relief - Sylhet", amount: 5000, status: "received" },
        { id: 2, crisisName: "Cyclone Recovery - Cox's Bazar", amount: 2000, status: "pledged" }
      ]
    }
  }

  getDonationById(id: number): object {
    return {
      message: "Donation fetched successfully",
      data: {
        id: id,
        crisisName: "Flood Relief - Sylhet",
        amount: 5000,
        status: "received"
      }
    }
  }
}

