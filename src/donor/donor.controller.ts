import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';
import { DonorService } from './donor.service';
import { DonorDTO } from './donor.dto';

@Controller('donor')
export class DonorController {
  constructor(private readonly donorService: DonorService) {}

  @Get('crises')
  getCrises(
    @Query('type') type?: string,
    @Query('city') city?: string,
  ): object {
    return this.donorService.getCrises(type, city);
  }

  @Get('crises/:id')
  getCrisisById(@Param('id', ParseIntPipe) id: number): object {
    return this.donorService.getCrisisById(id);
  }

  @Get('donations')
  getMyDonations(@Query('status') status?: string): object {
    return this.donorService.getMyDonations(status);
  }

  @Get('donations/:id')
  getDonationById(@Param('id') id: number): object {
    return this.donorService.getDonationById(id);
  }

  @Post('insertdonor')
  @UsePipes(new ValidationPipe())
  insertDonor(@Body() donorData: DonorDTO): object {
    return this.donorService.insertDonor(donorData);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(pdf|txt)$/)) {
          return cb(null, true);
        } else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'file'), false);
        }
      },
      limits: { fileSize: 30000 },
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File): object {
    return {
      message: 'File uploaded successfully',
      fileName: file.filename,
    };
  }
}
