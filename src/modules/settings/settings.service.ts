/**
 * Settings Service
 * Handles global site settings management
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all settings
   */
  async findAll(group?: string) {
    const where: any = {};

    if (group) {
      where.group = group;
    }

    return this.prisma.setting.findMany({
      where,
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Get setting by key
   */
  async findByKey(key: string) {
    return this.prisma.setting.findUnique({
      where: { key },
    });
  }

  /**
   * Set or update a setting
   */
  async set(key: string, value: any, type: string, group?: string) {
    const existing = await this.prisma.setting.findUnique({ where: { key } });
    if (existing) {
      return this.prisma.setting.update({
        where: { key },
        data: { value, type, group },
      });
    }
    return this.prisma.setting.create({
      data: { key, value, type, group },
    });
  }

  /**
   * Delete a setting
   */
  async remove(key: string) {
    return this.prisma.setting.delete({
      where: { key },
    });
  }

  /**
   * Get multiple settings as key-value object
   */
  async getSettings(keys: string[]) {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: { in: keys },
      },
    });

    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, any>,
    );
  }
}
