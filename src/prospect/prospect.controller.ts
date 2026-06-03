import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProspectService } from './prospect.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';

@Controller('prospect')
export class ProspectController {
  constructor(private readonly prospectService: ProspectService) {}

  @Post()
  create(@Body() createProspectDto: CreateProspectDto) {
    return this.prospectService.create(createProspectDto);
  }

  @Get()
  findAll() {
    return this.prospectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prospectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProspectDto: UpdateProspectDto) {
    return this.prospectService.update(+id, updateProspectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prospectService.remove(+id);
  }
}
