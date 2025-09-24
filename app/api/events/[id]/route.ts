import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Event } from "@/components/types/event.type";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
let events: Event[] = [];

function verifyToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new Error("Нет токена");
  const token = authHeader.split(" ")[1];
  return jwt.verify(token, JWT_SECRET) as { role: string };
}

// Редактирование
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const decoded = verifyToken(req);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Нет прав" }, { status: 403 });
    }

    const body = await req.json();
    events = events.map((ev) => (ev.id === id ? { ...ev, ...body } : ev));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка при обновлении мероприятия" }, { status: 401 });
  }
}

// Удаление
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const decoded = verifyToken(req);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Нет прав" }, { status: 403 });
    }

    events = events.filter((ev) => ev.id !== id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка при удаление мероприятия" }, { status: 401 });
  }
}
