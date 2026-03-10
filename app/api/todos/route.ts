import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const todos = await prisma.todo.findMany({
    orderBy: [{ completed: "asc" }, { updatedAt: "desc" }],
  });

  const body = todos.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    completed: t.completed,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  return NextResponse.json(body);
}

export async function POST(req: NextRequest) {
  let body: { title?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const description =
    typeof body.description === "string" ? body.description.trim() || null : null;

  const todo = await prisma.todo.create({
    data: {
      title,
      description: description ?? undefined,
    },
  });

  return NextResponse.json(
    {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    },
    { status: 201 }
  );
}