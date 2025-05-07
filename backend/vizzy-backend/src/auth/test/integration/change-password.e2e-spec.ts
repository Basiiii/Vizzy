import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e) - Trocar Palavra-Passe', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.user.create({
      data: {
        email: 'teste@vizzy.com',
        password: 'antiga123',
      },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'teste@vizzy.com', password: 'antiga123' });

    accessToken = loginRes.body.accessToken;
  });

  it('Deve trocar a palavra-passe com sucesso', async () => {
    const res = await request(app.getHttpServer())
      .patch('/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: 'antiga123',
        newPassword: 'nova123',
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Password updated successfully');

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'teste@vizzy.com', password: 'nova123' });

    expect(login.status).toBe(201);
    expect(login.body.accessToken).toBeDefined();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: 'teste@vizzy.com' },
    });

    await app.close();
  });
});
