import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const password = 'password123';
  let service: UsersService;

  beforeEach(() => (service = new UsersService()));

  it('stores normalized emails and exposes only public fields', async () => {
    const passwordHash = await bcrypt.hash(password, 4);
    const user = service.create({
      name: 'Maria Silva',
      email: 'MARIA@EXAMPLE.COM',
      passwordHash,
    });
    expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(user.email).toBe('maria@example.com');
    expect(user).not.toHaveProperty('passwordHash');
    const internal = service.findInternalByEmail('maria@example.com');
    expect(internal?.passwordHash).not.toBe(password);
    await expect(
      bcrypt.compare(password, internal!.passwordHash),
    ).resolves.toBe(true);
    await expect(
      bcrypt.compare('incorrect', internal!.passwordHash),
    ).resolves.toBe(false);
  });

  it('rejects duplicate emails ignoring case', async () => {
    const passwordHash = await bcrypt.hash(password, 4);
    service.create({ name: 'Maria', email: 'maria@example.com', passwordHash });
    expect(() =>
      service.create({
        name: 'Other',
        email: 'MARIA@example.com',
        passwordHash,
      }),
    ).toThrow('E-mail já cadastrado');
  });
});
