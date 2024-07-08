import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { testConfig } from 'src/_common/constants/test-config.constant';
import { Organisation } from 'src/organisation/entities/organisation.entity';
import { OrganisationService } from 'src/organisation/organisation.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

describe('OrganisationService', () => {
  let organisationService: OrganisationService;
  let mockOrganisationRepository: Partial<Repository<Organisation>>;

  const mockUser: User = testConfig().mockUser;
  const mockOrganisation: Organisation = testConfig().mockOrganisation;

  beforeAll(async () => {
    mockOrganisationRepository = {
      find: jest.fn().mockResolvedValue([mockOrganisation]),
      findOne: jest.fn().mockResolvedValue(mockOrganisation),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrganisationService,
        { provide: UserService, useValue: {} },
        {
          provide: getRepositoryToken(Organisation),
          useValue: mockOrganisationRepository,
        },
      ],
    }).compile();

    organisationService =
      moduleRef.get<OrganisationService>(OrganisationService);
  });

  it(`OrganisationService should be defined`, () => {
    expect(organisationService).toBeDefined();
  });

  it(`Users should only see data from all organisations they belong to`, () => {
    organisationService.getUserOrganisations(mockUser).then((result) => {
      expect(result).toEqual({ organisations: [mockOrganisation] });

      // Ensure that the find method was called with the correct parameters
      expect(mockOrganisationRepository.find).toHaveBeenCalledWith({
        where: { users: mockUser },
      });
    });
  });

  it(`Users should only see data from a single organisation they belong to`, () => {
    organisationService
      .getUserOrganisationByOrgId(mockOrganisation.orgId, mockUser)
      .then((result) => {
        expect(result).toEqual(mockOrganisation);

        // Ensure that the findOne method was called with the correct parameters
        expect(mockOrganisationRepository.findOne).toHaveBeenCalledWith({
          where: { orgId: mockOrganisation.orgId, users: mockUser },
        });
      });
  });
});
