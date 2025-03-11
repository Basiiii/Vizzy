// app/api/authentication/signup/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      // Log the error for debugging purposes
      console.error('Supabase Auth error:', authError.message);

      return NextResponse.json(
        { error: `Failed to login: ${authError.message}` },
        { status: 400 },
      );
    }

    return NextResponse.json({ user: data.user }, { status: 201 });
  } catch (error: unknown) {
    // Handle unexpected errors that may occur during processing
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error occurred during login';

    // Log the error for debugging purposes
    console.error('Unexpected error during login:', errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
