import { NextRequest, NextResponse } from 'next/server';
//import { UUID } from 'crypto';

//interface User {
//id: UUID;
//name: string;
//email: string;
//username: string;
//}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId not provided' }, { status: 400 });
  }

  console.log('userID received:', userId);
  try {
    const response = await fetch(`http://localhost:3001/users/${userId}`);

    if (!response.ok) {
      throw new Error('Error fetching user');
    }

    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    let errorMessage = 'Error fetching user';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      console.error('Unknown Error:', error);
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
