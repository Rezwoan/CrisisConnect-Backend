import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NgoService } from './ngo.service';
import { NgoDto, CreateNgoUserDto, UpdateNgoUserPhoneDto } from './ngo.dto';
import { Ngo } from './ngo.entity';

@Controller('ngo')
export class NgoController {
  constructor(private readonly ngoService: NgoService) {}

  @Get('crises')
  getAllCrises(
    @Query('status') status?: string,
    @Query('city') city?: string,
  ): object {
    return this.ngoService.getAllCrises(status, city);
  }

  @Get('crises/:id')
  getCrisisById(@Param('id') id: string): object {
    return this.ngoService.getCrisisById(id);
  }

  @Get('crises/:id/tasks')
  getTasksByCrisis(
    @Param('id') id: string,
    @Query('status') status?: string,
  ): object {
    return this.ngoService.getTasksByCrisis(id, status);
  }

  @Get('volunteers')
  getVolunteers(@Query('crisisId') crisisId?: string): object {
    return this.ngoService.getVolunteers(crisisId);
  }

  @Post('insertngo')
  @UsePipes(new ValidationPipe())
  insertNgo(@Body() userData: NgoDto): object {
    return this.ngoService.insertNgo(userData);
  }

  // --- User Category 2 operations (backed by the `ngo` table) ---

  @Post('users')
  @UsePipes(new ValidationPipe({ transform: true }))
  createUser(@Body() userData: CreateNgoUserDto): Promise<Ngo> {
    return this.ngoService.createUser(userData);
  }

  @Get('users')
  getAllUsers(): Promise<Ngo[]> {
    return this.ngoService.findAllUsers();
  }

  // Declared before 'users/:id' so "null-name" is not swallowed as an id.
  @Get('users/null-name')
  getUsersWithNullFullName(): Promise<Ngo[]> {
    return this.ngoService.findUsersWithNullFullName();
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string): Promise<Ngo> {
    return this.ngoService.findUserById(id);
  }

  @Put('users/:id/phone')
  @UsePipes(new ValidationPipe({ transform: true }))
  updatePhone(
    @Param('id') id: string,
    @Body() dto: UpdateNgoUserPhoneDto,
  ): Promise<Ngo> {
    return this.ngoService.updatePhone(id, dto);
  }

  @Delete('users/:id')
  removeUser(@Param('id') id: string): Promise<object> {
    return this.ngoService.removeUser(id);
  }
}
