"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTodo, updateTodo, deleteTodo } from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";

export type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date | null;
};

type TodoListProps = {
  initialTodos: TodoItem[];
};

export function TodoList({ initialTodos }: TodoListProps) {
  const router = useRouter();

  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title")?.toString().trim();

    if (!title) {
      toast.error("Title is required.");
      return;
    }

    setIsAdding(true);

    try {
      const result = await createTodo(formData);

      if (result.success) {
        toast.success("Assignment added.");
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleComplete = async (todo: TodoItem) => {
    try {
      const result = await updateTodo(todo.id, {
        completed: !todo.completed,
      });

      if (result.success) {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === todo.id ? { ...t, completed: !t.completed } : t
          )
        );
        router.refresh();
      }
    } catch {
      toast.error("Failed to update.");
    }
  };

  const handleEdit = async (
    todoId: string,
    title: string,
    description: string | null,
    dueDate: string | null
  ) => {
    setEditingId(todoId);

    try {
      const result = await updateTodo(todoId, {
        title,
        description,
        dueDate,
      });

      if (result.success) {
        toast.success("Assignment updated.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Failed to update.");
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (todoId: string) => {
    setDeletingId(todoId);

    try {
      const result = await deleteTodo(todoId);

      if (result.success) {
        setTodos((prev) => prev.filter((t) => t.id !== todoId));
        toast.success("Assignment deleted.");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="space-y-6" style={{ padding: 30 }}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          My Assignment Logbook
        </h2>
        <p className="text-muted-foreground">
          Add, edit, and complete your assignments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Add a new assignment</h3>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-2">
              <Label>Title</Label>
              <Input name="title" required placeholder="What needs to be done?" />
            </div>

            <div className="flex-1 space-y-2">
              <Label>Description</Label>
              <Input name="description" placeholder="Add details…" />
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" name="dueDate" />
            </div>

            <Button type="submit" disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Tasks</h3>
        </CardHeader>

        <CardContent>
          {todos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No assignments yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo)}
                    />

                    <div className="flex-1">
                      <p
                        className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""
                          }`}
                      >
                        {todo.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Assigned: {formatDateTime(todo.createdAt)}
                      </p>

                      {todo.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(todo.dueDate).toLocaleDateString("en-GB")}
                        </p>
                      )}

                      {todo.description && (
                        <p
                          onClick={() =>
                            setExpandedId(
                              expandedId === todo.id ? null : todo.id
                            )
                          }
                          className={`text-sm text-muted-foreground mt-1 cursor-pointer ${expandedId === todo.id ? "" : "line-clamp-2"
                            }`}
                        >
                          {todo.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <EditTodoDialog
                        todo={todo}
                        onSave={handleEdit}
                        isEditing={editingId === todo.id}
                        onOpenChange={() => { }}
                      />

                      <AlertDialog
                        open={deletingId === todo.id}
                        onOpenChange={(open) => !open && setDeletingId(null)}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete assignment
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{todo.title}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>

                            <AlertDialogAction
                              onClick={() => handleDelete(todo.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(todo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialog>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EditTodoDialog({
  todo,
  onSave,
}: any) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? "");
  const [dueDate, setDueDate] = useState(
    todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : ""
  );
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(todo.id, title, description || null, dueDate || null).then(() =>
      setOpen(false)
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit assignment</DialogTitle>
          <DialogDescription>Update details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}