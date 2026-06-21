import { Injectable } from '@nestjs/common';

@Injectable()
export class NgoService {
    private readonly crises = [
        { id: 1, title: 'Flood in Dhaka', status: 'active', city: 'Dhaka' },
        { id: 2, title: 'Earthquake in Chittagong', status: 'resolved', city: 'Chittagong' },
        { id: 3, title: "Cyclone in Cox's Bazar", status: 'active', city: "Cox's Bazar" },
    ];

    private readonly tasks = [
        { id: 1, crisisId: 1, title: 'Distribute dry food', requiredSkills: ['logistics', 'field support'], status: 'open' },
        { id: 2, crisisId: 1, title: 'Set up temporary shelter', requiredSkills: ['construction', 'coordination'], status: 'in-progress' },
        { id: 3, crisisId: 2, title: 'Provide first aid', requiredSkills: ['medical', 'emergency care'], status: 'open' },
    ];

    private readonly volunteers = [
        { id: 1, crisisId: 1, name: 'Ayesha Rahman', skills: ['medical', 'first aid'], applicationStatus: 'approved' },
        { id: 2, crisisId: 1, name: 'Tanvir Hasan', skills: ['logistics', 'driving'], applicationStatus: 'pending' },
        { id: 3, crisisId: 2, name: 'Nusrat Jahan', skills: ['translation', 'field support'], applicationStatus: 'approved' },
    ];

    getAllCrises(status?: string, city?: string): object {
        let result = [...this.crises];
        if (status) result = result.filter((c) => c.status === status);
        if (city) result = result.filter((c) => c.city.toLowerCase() === city.toLowerCase());
        return result;
    }

    getCrisisById(id: string): object {
        const crisis = this.crises.find((c) => c.id === +id);
        if (!crisis) return { error: 'Crisis not found' };
        return crisis;
    }

    getTasksByCrisis(id: string, status?: string): object {
        const crisis = this.crises.find((c) => c.id === +id);
        if (!crisis) return { error: 'Crisis not found' };

        let result = this.tasks.filter((t) => t.crisisId === +id);
        if (status) result = result.filter((t) => t.status === status);
        return result;
    }

    getVolunteers(crisisId?: string): object {
        let result = [...this.volunteers];
        if (crisisId) result = result.filter((v) => v.crisisId === +crisisId);
        return result.map(({ id, name, skills, applicationStatus }) => ({
            id,
            name,
            skills,
            applicationStatus,
        }));
    }
}