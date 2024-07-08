import {
  HttpStatus,
  INestApplication,
  Logger,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { testConfig } from 'src/_common/constants/test-config.constant';
import { UserWithAccessToken } from 'src/auth/dto/user-registered.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const logger = new Logger('AuthController (e2e)');

  let newUser: CreateUserDto;

  let userWithAccessToken: UserWithAccessToken;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        validationError: {
          target: false,
          value: false,
        },
        exceptionFactory: (validationErrors: ValidationError[] = []) => {
          const transformed = validationErrors.map((error) => {
            const message = Object.values(error.constraints)[0];

            return {
              field: error.property,
              message,
            };
          });

          return new UnprocessableEntityException(transformed);
        },
      }),
    );

    await app.init();

    newUser = {
      firstName: testConfig().mockUser.firstName,
      lastName: testConfig().mockUser.lastName,
      email: testConfig().mockUser.email,
      password: testConfig().mockUser.password,
      phone: testConfig().mockUser?.phone,
    };
  });

  describe('It Should Register User Successfully with Default Organisation', () => {
    it('Ensure a user is registered successfully when no organisation details are provided', async () => {
      const registrationResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(HttpStatus.CREATED);

      expect(registrationResponse?.body).not.toBeNull();

      expect(registrationResponse?.body).toHaveProperty('status', 'success');
      expect(registrationResponse?.body).toHaveProperty(
        'message',
        'Registration successful',
      );
      expect(registrationResponse?.body).toHaveProperty('data');

      expect(registrationResponse?.body?.data).not.toBeNull();

      userWithAccessToken = registrationResponse?.body.data;
    });

    it(`Verify the default organisation name is correctly generated (e.g., "John's Organisation" for a user with the first name "John"`, async () => {
      const organisationsResponse = await request(app.getHttpServer())
        .get('/api/organisations')
        .withCredentials()
        .set('Authorization', `Bearer ${userWithAccessToken.accessToken}`)
        .expect(HttpStatus.OK);

      expect(organisationsResponse?.body).not.toBeNull();

      expect(organisationsResponse?.body).toHaveProperty('status', 'success');

      expect(organisationsResponse?.body).toHaveProperty('data');

      expect(organisationsResponse?.body?.data).not.toBeNull();

      expect(organisationsResponse?.body?.data).toHaveProperty('organisations');

      const organisations = organisationsResponse?.body?.data?.organisations;

      expect(Array.isArray(organisations)).toBeTruthy();

      expect(organisations).toHaveLength(1);

      expect(organisations[0]).toHaveProperty(
        'name',
        `${newUser.firstName}'s Organisation`,
      );
    });

    it('Check that the response contains the expected user details and access token.', async () => {
      expect(userWithAccessToken?.user).not.toBeNull();

      expect(userWithAccessToken?.user).toHaveProperty('userId');

      expect(userWithAccessToken?.user).toHaveProperty(
        'firstName',
        newUser.firstName,
      );

      expect(userWithAccessToken?.user).toHaveProperty(
        'lastName',
        newUser.lastName,
      );

      expect(userWithAccessToken?.user).toHaveProperty(
        'email',
        newUser.email.toLowerCase(),
      );

      // Ensure password is not returned
      expect(userWithAccessToken?.user).not.toHaveProperty('password');

      if (newUser?.phone) {
        expect(userWithAccessToken?.user).toHaveProperty(
          'phone',
          newUser.phone,
        );
      } else {
        expect(userWithAccessToken?.user?.phone).toBeNull();
      }

      // check for access token
      expect(userWithAccessToken?.accessToken).not.toBeNull();
    });
  });

  describe('It Should Log the user in successfully', () => {
    it('Ensure a user is logged in successfully with valid credentials', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: newUser.email, password: newUser.password })
        .expect(HttpStatus.OK);

      expect(loginResponse?.body).not.toBeNull();

      expect(loginResponse?.body).toHaveProperty('status', 'success');
      expect(loginResponse?.body).toHaveProperty('message', 'Login successful');
      expect(loginResponse?.body).toHaveProperty('data');
      expect(loginResponse?.body.data).toHaveProperty('user');
      expect(loginResponse?.body.data).toHaveProperty('accessToken');

      expect(loginResponse?.body?.data).not.toBeNull();

      userWithAccessToken = loginResponse?.body.data;
    });

    it('Ensure login fails with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: newUser.email, password: 'wrongPassword' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('It Should Fail If Required Fields Are Missing', () => {
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'password',
    ] satisfies (keyof typeof newUser)[];

    requiredFields.forEach((field) => {
      it(`Ensure registration fails if ${field} is missing`, async () => {
        const { [field]: omitted, ...partialUser } = newUser;
        logger.log({ omitted, partialUser });

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(partialUser)
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);

        const errors = response?.body?.errors;

        expect(Array.isArray(errors)).toBeTruthy();

        expect(errors?.length).toBeGreaterThanOrEqual(1);

        const fieldStartWithVowel = ['a', 'e', 'i', 'u'].includes(
          field.charAt(0),
        );

        expect(errors[0]).toHaveProperty('field', field);

        if (field === 'email') {
          expect(errors[0]).toHaveProperty('message', `email must be an email`);
        } else {
          expect(errors[0]).toHaveProperty(
            'message',
            `${field} must be ${fieldStartWithVowel ? 'an' : 'a'} string`,
          );
        }
      });
    });
  });

  describe('It Should Fail if there’s Duplicate Email or UserID', () => {
    it('Attempt to register the same user', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
