"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type ActionResult = { success: true } | { success: false; error: string };

export async function createTodo(formData: FormData): Promise<ActionResult> {
  const title = formData.get("title")?.toString().trim();

  if (!title) {
    return { success: false, error: "Title is required." };
  }

  const description = formData.get("description")?.toString().trim() || null;
  const dueDateValue = formData.get("dueDate")?.toString().trim() || null;

  const dueDate = dueDateValue ? new Date(dueDateValue) : null;

  try {
    await prisma.todo.create({
      data: {
        title,
        description,
        dueDate,
      },
    });

    revalidatePath("/todos");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("createTodo error:", err);
    return { success: false, error: "Failed to create todo. Please try again." };
  }
}

export async function updateTodo(
  todoId: string,
  data: {
    title?: string;
    description?: string | null;
    completed?: boolean;
    dueDate?: string | null;
  }
): Promise<ActionResult> {
  if (data.title !== undefined && !data.title.trim()) {
    return { success: false, error: "Title cannot be empty." };
  }

  try {
    const payload: any = {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && {
        description: data.description?.trim() || null,
      }),
      ...(data.completed !== undefined && { completed: data.completed }),
    };

    if (Object.prototype.hasOwnProperty.call(data, "dueDate")) {
      payload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    await prisma.todo.update({
      where: { id: todoId },
      data: payload,
    });

    revalidatePath("/todos");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("updateTodo error:", err);
    return { success: false, error: "Failed to update todo. Please try again." };
  }
}

export async function deleteTodo(todoId: string): Promise<ActionResult> {
  try {
    await prisma.todo.delete({
      where: { id: todoId },
    });

    revalidatePath("/todos");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err) {
    console.error("deleteTodo error:", err);
    return { success: false, error: "Failed to delete todo. Please try again." };
  }
}