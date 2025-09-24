import { NextResponse } from "next/server";
import { prisma } from "@/components/lib/prisma";

// GET /api/events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
      include: { category: true }, // Include category data in the response
    });
    return NextResponse.json(events);
  } catch (err: unknown) {
    return NextResponse.json({ error: "Ошибка при получении событий" }, { status: 500 });
  }
}

// POST /api/events
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.title || !body.description || !body.date || !body.time || !body.categoryId) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        time: body.time,
        category: {
          connect: { id: body.categoryId }, // Connect to the category by ID
        },
      },
    });
    return NextResponse.json(newEvent, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ошибка при создании события" }, { status: 500 });
  }
}

// PUT /api/events
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.id || !body.title || !body.description || !body.date || !body.time || !body.categoryId) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    const updated = await prisma.event.update({
      where: { id: body.id }, // ID should be a string (UUID) based on your schema
      data: {
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        time: body.time,
        category: {
          connect: { id: body.categoryId }, // Connect to the category by ID
        },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Ошибка при обновлении события" }, { status: 500 });
  }
}

// DELETE /api/events
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID события обязателен" }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id }, // ID is a string (UUID) based on your schema
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка при удалении события" }, { status: 500 });
  }
}