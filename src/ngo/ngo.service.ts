import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ngo } from './entities/ngo.entity';

// Business logic for the NGO role (User Category 2). Replace this
// stub with real DB-backed logic as routes are added back.
@Injectable()
export class NgoService {
  constructor(
    @InjectRepository(Ngo)
    private readonly ngoRepository: Repository<Ngo>,
  ) {}

  getStatus(): string {
    return 'NGO module is working';
  }

  async uploadProfileImage(userId: number, filename: string): Promise<object> {
    if (!filename) {
      throw new BadRequestException('Image file is required');
    }

    const profileImage = `/uploads/ngo/${filename}`;
    await this.ngoRepository
      .createQueryBuilder()
      .update(Ngo)
      .set({ profileImage })
      .where('userId = :userId', { userId })
      .execute();

    return {
      message: 'Profile image uploaded successfully',
      profileImage,
    };
  }
}
