import { Test, TestingModule } from '@nestjs/testing';
import { ProspectController } from './prospect.controller';
import { ProspectService } from './prospect.service';

describe('ProspectController', () => {
  let controller: ProspectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProspectController],
      providers: [ProspectService],
    }).compile();

    controller = module.get<ProspectController>(ProspectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
