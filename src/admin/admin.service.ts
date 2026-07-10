import { Injectable } from '@nestjs/common';
import { AdminDto } from './admin.dto';

@Injectable()
export class AdminService {
  private readonly dummyUsers = [
    { id: 1, name: 'Alice Johnson', role: 'admin', isActive: true },
    { id: 2, name: 'Bob Smith', role: 'donor', isActive: true },
    { id: 3, name: 'Charlie Brown', role: 'ngo', isActive: false },
    { id: 4, name: 'Diana Prince', role: 'volunteer', isActive: true },
  ];

  private readonly dummyOrganizations = [
    { id: 101, name: 'Acme Corp', status: 'verified' },
    { id: 102, name: 'Stark Industries', status: 'pending' },
  ];

  getUsers(role?: string, isActive?: string): object {
    let users = [...this.dummyUsers];

    if (role) {
      users = users.filter(
        (user) => user.role.toLowerCase() === role.toLowerCase(),
      );
    }

    if (isActive) {
      const isTrue = isActive.toLowerCase() === 'true';
      users = users.filter((user) => user.isActive === isTrue);
    }

    return {
      message:
        users.length > 0
          ? 'Successfully retrieved dummy users list'
          : 'No dummy users found',
      count: users.length,
      data: users,
    };
  }

  getUserById(id: number): object {
    const user = this.dummyUsers.find((user) => user.id == id) || null;

    return {
      message: user
        ? `Successfully retrieved dummy user with ID: ${user.id}`
        : `No user found with ID: ${id}`,
      data: user,
    };
  }

  getOrganizations(status?: string): object {
    let organizations = [...this.dummyOrganizations];

    if (status) {
      organizations = organizations.filter(
        (org) => org.status.toLowerCase() === status.toLowerCase(),
      );
    }

    return {
      message:
        organizations.length > 0
          ? 'Successfully retrieved dummy organizations list'
          : 'No dummy organizations found',
      count: organizations.length,
      data: organizations,
    };
  }

  getOrganizationById(id: number): object {
    const organization =
      this.dummyOrganizations.find((org) => org.id == id) || null;

    return {
      message: organization
        ? `Successfully retrieved dummy organization with ID: ${organization.id}`
        : `No organization found with ID: ${id}`,
      data: organization,
    };
  }

  insertAdmin(userData: AdminDto): object {
    userData.name = userData.name.trim();
    userData.email = userData.email.trim();
    userData.nidNumber = userData.nidNumber.trim();
    return {
      message: 'Admin inserted successfully',
      data: userData,
    };
  }
}
