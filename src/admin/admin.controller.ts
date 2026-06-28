import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, MulterError } from 'multer';
import { AdminService } from './admin.service';
import { AdminDto } from './admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getUsers(
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ): object {
    return this.adminService.getUsers(role, isActive);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: number): object {
    return this.adminService.getUserById(id);
  }

  @Get('organizations')
  getOrganizations(@Query('status') status?: string): object {
    return this.adminService.getOrganizations(status);
  }

  @Get('organizations/:id')
  getOrganizationById(@Param('id') id: number): object {
    return this.adminService.getOrganizationById(id);
  }

  @Post('/insertadmin')
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileInterceptor('fileName', {
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          cb(null, Date.now() + file.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|jpeg|png|webp)$/)) {
          return cb(null, true);
        } else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
        }
      },
    }),
  )
  insertAdmin(
    @Body() userData: AdminDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2000000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    userData.fileName = file.filename;
    console.log(userData);
    return this.adminService.insertAdmin(userData);
  }

  @Get('/uploadedimage/:fileName')
  getUploadedImage(@Param('fileName') fileName: string, @Res() res) {
    res.sendFile(fileName, { root: './uploads' });
  }
}
