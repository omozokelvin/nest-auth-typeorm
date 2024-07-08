import { faker } from '@faker-js/faker';
import { User } from 'src/user/entities/user.entity';

export const testConfig = () => {
  const mockUser: User = {
    userId: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    organisations: [],
    // add phone number sometimes because it's optional
    ...(faker.datatype.boolean() && {
      phone: faker.phone.number(),
    }),
  };

  return {
    mockUser,
    mockOrganisation: {
      orgId: faker.string.uuid(),
      name: faker.company.name(),
      users: [{ ...mockUser }],
    },
  };
};
