import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Volunteer } from './volunteer.entity';
import { CreateVolunteerDto } from './volunteer.dto';

@Injectable()
export class VolunteerService {
  constructor(
    @InjectRepository(Volunteer)
    private readonly volunteerRepository: Repository<Volunteer>,
  ) {}

  async createVolunteer(dto: CreateVolunteerDto): Promise<Volunteer> {
    const volunteer = this.volunteerRepository.create({
      username: dto.username,
      fullName: dto.fullName,
    });
    return this.volunteerRepository.save(volunteer);
  }

  async findByFullNameContains(substring: string): Promise<Volunteer[]> {
    return this.volunteerRepository.find({
      where: { fullName: Like(`%${substring}%`) },
    });
  }

  async findByUsername(username: string): Promise<Volunteer> {
    const volunteer = await this.volunteerRepository.findOne({
      where: { username: username },
    });

    if (!volunteer) {
      throw new NotFoundException(
        `No volunteer found with username: ${username}`,
      );
    }

    return volunteer;
  }

  async deleteByUsername(username: string): Promise<object> {
    const result = await this.volunteerRepository.delete({
      username: username,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `No volunteer found with username: ${username}`,
      );
    }

    return { message: `Volunteer ${username} deleted successfully` };
  }
}
