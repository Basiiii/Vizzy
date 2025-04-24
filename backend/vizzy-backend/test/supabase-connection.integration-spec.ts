import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SupabaseService } from '../src/supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';

describe('Supabase Connection (Integration)', () => {
  let app: INestApplication;
  let supabaseService: SupabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [SupabaseService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    supabaseService = moduleFixture.get<SupabaseService>(SupabaseService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should connect to Supabase successfully', async () => {
    const client = supabaseService.getPublicClient();
    const { data, error } = await client.rpc('health_check');

    expect(error).toBeNull();
    expect(data).toBe(true);
  });

  it('should be able to query a table', async () => {
    const client = supabaseService.getPublicClient();

    // Try to query any table
    const { error } = await client.from('profiles').select('*').limit(1);

    // We're just checking if the query executes without error
    expect(error).toBeNull();
  });
});
