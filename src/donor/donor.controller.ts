import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { DonorService } from './donor.service';

@Controller('donor')
export class DonorController {

    constructor(private readonly donorService: DonorService) {}
    @Get('crises')
  getCrises(@Query('type') type: string, @Query('city') city: string): object {
    return this.donorService.getCrises(type, city);
  }

  @Get('crises/:id')
  getCrisisById(@Param('id',ParseIntPipe) id:number):object{
    console.log(id);
    console.log(typeof id);

    return this.donorService.getCrisisById(id);
  }

  /*@Get('crises/:id')
  getCrisisById(@Param('id') id: number): object {
    return this.donorService.getCrisisById(id);
  }*/

  @Get('donations')
  getMyDonations(@Query('status') status: string): object {
    return this.donorService.getMyDonations(status);
  }

  @Get('donations/:id')
  getDonationById(@Param('id') id: number): object {
    return this.donorService.getDonationById(id);
  }

  @Get('test')
test() {
  return {
    message: 'Test route works',
  };
}

}
