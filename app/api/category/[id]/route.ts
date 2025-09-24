import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/components/lib/prisma";
import { Category } from "@prisma/client";

// GET /api/category/:id → получить категорию
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← params — это Promise!
): Promise<NextResponse> {
  const { id } = await params; // ← обязательно await

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Категория не найдена" }, { status: 404 });
    }

    return NextResponse.json<Category>(category);
  } catch (error: unknown) {
    console.error("Ошибка при получении категории:", error);
    return NextResponse.json({ error: "Ошибка при получении категории" }, { status: 500 });
  }
}

// PUT /api/category/:id → обновить категорию
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← Promise!
): Promise<NextResponse> {
  const { id } = await params; // ← await

  try {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Название категории обязательно" }, { status: 400 });
    }

    // Check for duplicate category name
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });
    if (existingCategory && existingCategory.id !== id) {
      return NextResponse.json({ error: "Категория с таким именем уже существует" }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json<Category>(category);
  } catch (error: unknown) {
    console.error("Ошибка при обновлении категории:", error);
    return NextResponse.json({ error: "Ошибка при обновлении категории" }, { status: 500 });
  }
}

// DELETE /api/category/:id → удалить категорию
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← Promise!
): Promise<NextResponse> {
  const { id } = await params; // ← await

  try {
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
    return NextResponse.json({ message: "Категория удалена" });
  } catch (error: unknown) {
    console.error("Ошибка при удалении категории:", error);
    return NextResponse.json({ error: "Ошибка при удалении категории" }, { status: 500 });
  }
}