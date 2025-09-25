import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password === "0200") {
    const token = jwt.sign({ role: "admin" }, SECRET, { expiresIn: "1h" });

    const res = NextResponse.json({ success: true });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 час
      path: "/",
    });

    return res;
  }

  return NextResponse.json({ success: false, message: "Неверный пароль" }, { status: 401 });
}
