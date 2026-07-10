import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { DonorService } from './donor.service';
import { DonorDTO } from './donor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from "multer";


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

  @Post("createDonor")
  createDonor(@Body() donorData : DonorDTO) : DonorDTO{
    return  this.donorService.createDonor(donorData);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file',
    { fileFilter: (req, file, cb) => {
      if (file.originalname.match(/^.*\.(pdf|txt)$/))
cb(null, true);
else {
cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
}
},
limits: { fileSize: 30000 },
storage:diskStorage({
destination: './uploads',
filename: function (req, file, cb) {
cb(null,Date.now()+file.originalname)
},
})
}))
  uploadFile(@UploadedFile() file: any){
    console.log(file);
  }

}
