import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { appConfig } from 'src/_common/constants/app-config.constant';
import { testConfig } from 'src/_common/constants/test-config.constant';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  const mockUser: User = testConfig().mockUser;

  const mockSecret = 'mockTestSecret';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: mockSecret,
          signOptions: { expiresIn: appConfig().expiresIn },
        }),
      ],

      providers: [AuthService, { provide: UserService, useValue: {} }],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  it(`AuthService should be defined`, () => {
    expect(authService).toBeDefined();
  });

  it('Token should expire after one hour', () => {
    const now = Math.floor(Date.now() / 1000);
    const inOneHour = now + 3600;

    const leeway = 30; // 30 seconds leeway

    authService.generateToken(mockUser, '').then(({ accessToken }) => {
      const decoded = jwtService.decode(accessToken);

      expect(typeof accessToken).toBe('string');

      // Check if the exp is within the expected range, considering the leeway
      expect(decoded.exp).toBeGreaterThanOrEqual(inOneHour - leeway);
      expect(decoded.exp).toBeLessThanOrEqual(inOneHour + leeway);
    });
  });

  it('Token should have correct userId as sub', async () => {
    authService.generateToken(mockUser, '').then(({ accessToken }) => {
      const decoded = jwtService.decode(accessToken);

      expect(typeof accessToken).toBe('string');

      expect(decoded.sub).toBe(mockUser.userId);
    });
  });
});
