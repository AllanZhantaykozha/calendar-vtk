import { NextResponse } from "next/server";
import { prisma } from "@/components/lib/prisma";

// GET /api/category/:id → получить категорию
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

// PUT /api/category/:id → обновить категорию
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await req.json();
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name },
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/category/:id → удалить категорию
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.category.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
