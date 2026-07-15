import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { NgoDto, CreateNgoUserDto, UpdateNgoUserPhoneDto } from './ngo.dto';
import { Ngo } from './ngo.entity';

@Injectable()
export class NgoService {
  constructor(
    @InjectRepository(Ngo)
    private readonly ngoRepo: Repository<Ngo>,
  ) {}

  private crises: any[] = [
    { id: '1', title: 'Flood in Dhaka', status: 'active', city: 'Dhaka' },
    {
      id: '2',
      title: 'Earthquake in Chittagong',
      status: 'resolved',
      city: 'Chittagong',
    },
    {
      id: '3',
      title: "Cyclone in Cox's Bazar",
      status: 'active',
      city: "Cox's Bazar",
    },
  ];

  private tasks: any[] = [
    {
      id: '1',
      crisisId: '1',
      title: 'Distribute dry food',
      requiredSkills: ['logistics', 'field support'],
      status: 'open',
    },
    {
      id: '2',
      crisisId: '1',
      title: 'Set up temporary shelter',
      requiredSkills: ['construction', 'coordination'],
      status: 'in-progress',
    },
    {
      id: '3',
      crisisId: '2',
      title: 'Provide first aid',
      requiredSkills: ['medical', 'emergency care'],
      status: 'open',
    },
  ];

  private volunteers: any[] = [
    {
      id: '1',
      crisisId: '1',
      name: 'Ayesha Rahman',
      skills: ['medical', 'first aid'],
      applicationStatus: 'approved',
    },
    {
      id: '2',
      crisisId: '1',
      name: 'Tanvir Hasan',
      skills: ['logistics', 'driving'],
      applicationStatus: 'pending',
    },
    {
      id: '3',
      crisisId: '2',
      name: 'Nusrat Jahan',
      skills: ['translation', 'field support'],
      applicationStatus: 'approved',
    },
  ];

  getAllCrises(status?: string, city?: string): object {
    const result: any[] = [];

    for (let i = 0; i < this.crises.length; i++) {
      const crisis = this.crises[i];
      let match = true;

      if (status && crisis.status !== status) {
        match = false;
      }
      if (city && crisis.city !== city) {
        match = false;
      }
      if (match) {
        result.push(crisis);
      }
    }

    return result;
  }

  getCrisisById(id: string): object {
    for (let i = 0; i < this.crises.length; i++) {
      if (this.crises[i].id === id) {
        return this.crises[i];
      }
    }
    return { error: 'Crisis not found' };
  }

  getTasksByCrisis(crisisId: string, status?: string): object {
    const result: any[] = [];

    for (let i = 0; i < this.tasks.length; i++) {
      const task = this.tasks[i];
      let match = true;

      if (task.crisisId !== crisisId) {
        match = false;
      }
      if (status && task.status !== status) {
        match = false;
      }
      if (match) {
        result.push(task);
      }
    }

    return result;
  }

  getVolunteers(crisisId?: string): object {
    const result: any[] = [];

    for (let i = 0; i < this.volunteers.length; i++) {
      const volunteer = this.volunteers[i];

      if (crisisId && volunteer.crisisId !== crisisId) {
        continue;
      }
      result.push(volunteer);
    }

    return result;
  }

  insertNgo(userData: NgoDto): object {
    return {
      message: 'NGO inserted successfully',
      data: userData,
    };
  }

  // --- User Category 2 operations (backed by the `ngo` table) ---

  async createUser(userData: CreateNgoUserDto): Promise<Ngo> {
    // create() + save() (not insert()) so the @BeforeInsert generateId()
    // hook runs and the saved entity comes back with its id.
    const user = this.ngoRepo.create({
      fullName: userData.fullName ?? null,
      phone: String(userData.phone),
    });
    return this.ngoRepo.save(user);
  }

  async findAllUsers(): Promise<Ngo[]> {
    return this.ngoRepo.find();
  }

  async findUserById(id: string): Promise<Ngo> {
    const user = await this.ngoRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`No user found with id: ${id}`);
    }
    return user;
  }

  async updatePhone(id: string, dto: UpdateNgoUserPhoneDto): Promise<Ngo> {
    const user = await this.ngoRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`No user found with id: ${id}`);
    }
    user.phone = String(dto.phone);
    return this.ngoRepo.save(user);
  }

  async findUsersWithNullFullName(): Promise<Ngo[]> {
    return this.ngoRepo.findBy({ fullName: IsNull() });
  }

  async removeUser(id: string): Promise<object> {
    const result = await this.ngoRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`No user found with id: ${id}`);
    }
    return { message: `User ${id} removed successfully` };
  }
}
