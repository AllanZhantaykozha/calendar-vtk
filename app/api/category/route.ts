// pages/api/category.ts
import { NextResponse } from "next/server";
import { prisma } from "@/components/lib/prisma";

// GET /api/category
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка при получении категорий" }, { status: 500 });
  }
}

// POST /api/category
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Название категории обязательно" }, { status: 400 });
    }

    // Check for duplicate category name
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });
    if (existingCategory) {
      return NextResponse.json({ error: "Категория с таким именем уже существует" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
      },
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка при создании категории" }, { status: 500 });
  }
}

// PUT /api/category
export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();

    if (!id || !name || !name.trim()) {
      return NextResponse.json({ error: "ID и название категории обязательны" }, { status: 400 });
    }

    // Check for duplicate category name
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });
    if (existingCategory && existingCategory.id !== id) {
      return NextResponse.json({ error: "Категория с таким именем уже существует" }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(updatedCategory);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка при обновлении категории" }, { status: 500 });
  }
}

// DELETE /api/category
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID категории обязателен" }, { status: 400 });
    }

    // Check if category is used by any events
    const eventsCount = await prisma.event.count({
      where: { categoryId: id },
    });
    if (eventsCount > 0) {
      return NextResponse.json(
        { error: "Нельзя удалить категорию, которая используется в мероприятиях" },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка при удалении категории" }, { status: 500 });
  }
}