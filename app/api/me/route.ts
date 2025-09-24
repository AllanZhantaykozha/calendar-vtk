import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const token = cookieHeader
    ?.split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ isLoggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    return NextResponse.json({ isLoggedIn: true, user: decoded });
  } catch (err: any) {
    return NextResponse.json({ isLoggedIn: false });
  }
}
