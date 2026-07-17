import { Controller, Get, Post, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../common/config/multer.config';
import { NgoService } from './ngo.service';

// Base HTTP entry point for the NGO role (User Category 2).
// File uploads for this role go into its own uploads/ngo folder —
// implement the upload/download endpoints here when needed.
@Controller('ngo')
export class NgoController {
  constructor(private readonly ngoService: NgoService) {}

  // Confirms the NGO module is wired up and working.
  @Get()
  getStatus(): string {
    return this.ngoService.getStatus();
  }

  // TODO: @UseGuards(NgoGuard) once the NGO auth guard exists (Phase 11)
  @Post('profile/image')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions('ngo')))
  uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.ngoService.uploadProfileImage(req.user?.id, file?.filename);
  }
}
