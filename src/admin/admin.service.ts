import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Admin } from './admin.entity';
import { AdminDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async createAdmin(adminDto: AdminDto): Promise<Admin> {
    const admin = this.adminRepository.create(adminDto);
    return await this.adminRepository.save(admin);
  }

  async updateStatus(id: number, status: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id: id } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    admin.status = status;
    return await this.adminRepository.save(admin);
  }

  async getInactiveUsers(): Promise<Admin[]> {
    return await this.adminRepository.find({ where: { status: 'inactive' } });
  }

  async getUsersOver40(): Promise<Admin[]> {
    return await this.adminRepository.find({ where: { age: MoreThan(40) } });
  }
}
