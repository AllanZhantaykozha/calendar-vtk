import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretkey');

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
