import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export function imageUploadOptions(destinationFolder: string) {
  return {
    storage: diskStorage({
      destination: `./uploads/${destinationFolder}`,
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only jpeg, png, or webp images are allowed'), false);
      }
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  };
}
