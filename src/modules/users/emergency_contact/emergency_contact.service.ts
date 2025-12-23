import { Injectable, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../prisma.service';
import { GenericCrudService } from '../../../common/services/generic-crud.service';
import { Prisma } from '@prisma/client';
import { EmergencyContact } from './emergency_contact.model';

type CreateEmergencyContactDto = Prisma.emergency_contactsCreateInput;
type UpdateEmergencyContactDto = Prisma.emergency_contactsUpdateInput;

/**
 * EmergencyContact service using GenericCrudService
 * Reduced from ~208 lines to ~80 lines
 */
@Injectable()
export class EmergencyContactService extends GenericCrudService<EmergencyContact, CreateEmergencyContactDto, UpdateEmergencyContactDto> {

  constructor(
    prisma: PrismaService,
    @Inject(CACHE_MANAGER) cacheManager: Cache
  ) {
    super(prisma, cacheManager, {
      modelName: 'EmergencyContact',
      idField: 'emergency_id',
      nameField: 'name',
      cacheTTL: 3600000,
      enableCache: true
    });
  }

  protected getModel() {
    return this.prisma.emergency_contacts;
  }

  protected getSelectFields() {
    return {
      emergency_id: true,
      name: true,
      phone: true,
      relationship_type: true
    };
  }

  protected async validateCreate(dto: CreateEmergencyContactDto): Promise<void> {
    if (!dto.name) {
      throw new BadRequestException({
        status: false,
        message: 'Name is required'
      });
    }
  }

  /**
   * Find all emergency contacts by user ID
   */
  async findAllByUser(userId: string) {
    const cacheKey = `user_${userId}_emergency_contacts`;

    if (this.enableCache) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached as { status: boolean; data: any[]; total: number };
    }

    const results = await this.prisma.emergency_contacts.findMany({
      where: { owner_id: userId, active: true },
      select: {
        emergency_id: true,
        name: true,
        phone: true,
        relationship_type: true,
        relationship_type_emergency_contacts_relationship_typeTorelationship_type: {
          select: { name: true }
        }
      }
    });

    const transformedResults = results.map(contact => ({
      emergency_id: contact.emergency_id,
      name: contact.name,
      phone: contact.phone,
      relationship_type: contact.relationship_type,
      relationship_type_name: contact.relationship_type_emergency_contacts_relationship_typeTorelationship_type?.name || null
    }));

    const response = { status: true, data: transformedResults, total: transformedResults.length };

    if (this.enableCache) {
      await this.cacheManager.set(cacheKey, response, this.cacheTTL);
    }

    return response;
  }
}