// app/api/authentication/signup/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handle user sign-up requests
 * This function receives a POST request with the user's email, password, username, and name.
 * It validates the input, creates the user in Supabase Auth, and returns a response.
 *
 * @param {NextRequest} request - The incoming HTTP request containing user details
 * @returns {NextResponse} - A JSON response with the outcome of the sign-up process
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // Parse the incoming JSON request body
    const { email, password, username, name } = await request.json();

    // Basic input validation: Ensure all required fields are present
    if (!email || !password || !username || !name) {
      return NextResponse.json(
        { error: 'Email, password, username, and name are required' },
        { status: 400 },
      );
    }

    // Create user in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          name: name,
        },
      },
    });

    // Handle errors from Supabase Auth
    if (authError) {
      // Log the error for debugging purposes
      console.error('Supabase Auth error:', authError.message);

      return NextResponse.json(
        { error: `Failed to sign up: ${authError.message}` },
        { status: 400 },
      );
    }

    // Return a successful response with the user data
    return NextResponse.json({ user: data.user }, { status: 201 });
  } catch (error: unknown) {
    // Handle unexpected errors that may occur during processing
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error occurred during sign-up';

    // Log the error for debugging purposes
    console.error('Unexpected error during sign-up:', errorMessage);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
