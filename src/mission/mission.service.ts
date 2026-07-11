import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientService } from '../database/prisma-client.service';
import { CreateMissionDTO } from './dto/create-mission.dto';
import { MissionQueryDTO } from './dto/mission-query.dto';

@Injectable()
export class MissionService {
  constructor(private readonly prismaClientService: PrismaClientService) {}

  // -
  async findAll(query: MissionQueryDTO, tenantId: number) {
    try {
      const filter = { tenantId };

      if (query.code && query.code.length) {
        filter['code'] = query.code;
      }

      if (query.domain && query.domain.length) {
        filter['domain'] = query.domain;
      }

      if (query.name && query.name.length) {
        filter['name'] = query.name;
      }

      const missions = await this.prismaClientService.mission.findMany({
        where: filter,
      });

      const count = await this.prismaClientService.mission.count({
          where: { tenantId }
      });

      return { missions, count };
    } catch (err) {
      console.log('Error while getting the missions: ', err);
      throw new InternalServerErrorException(
        'Error while getting the missions.',
      );
    }
  }

  // -
  async create(createMissionDto: CreateMissionDTO, tenantId: number) {
    try {
      return await this.prismaClientService.mission.create({
        data: {
          code: createMissionDto.code,
          domain: createMissionDto.domain,
          name: createMissionDto.name,
          tasks: {
            createMany: {
              data: createMissionDto.tasks,
            },
          },
          tenantId,
        },
      });
    } catch (err) {
      console.log('Error while creating the mission: ', err);
      throw new InternalServerErrorException(
        'Error while creating the mission.',
      );
    }
  }

  // -
  async findOne (id: number, tenantId: number) {
    try {
        return await this.prismaClientService.mission.findUnique({
            where: {
                id,
                tenantId
            },
            select: {
                code: true,
                domain: true,
                name: true,
                tasks: true
            }
        })
    }
    catch(err) {
        console.log("Error while fetching the mission: ", err);
        throw new InternalServerErrorException("Error while fetching the mission.")
    }
  }
}
