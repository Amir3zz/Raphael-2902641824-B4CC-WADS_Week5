import { prisma } from "@/lib/prisma";
import { TodoList, type TodoItem } from "./todo-list";

export default async function TodosPage() {
  const todos = await prisma.todo.findMany({
    orderBy: [{ completed: "asc" }, { updatedAt: "desc" }],
  });

  const initialTodos: TodoItem[] = todos.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    completed: t.completed,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
    dueDate: t.dueDate ? new Date(t.dueDate) : null,
  }));

  return <TodoList initialTodos={initialTodos} />;
}