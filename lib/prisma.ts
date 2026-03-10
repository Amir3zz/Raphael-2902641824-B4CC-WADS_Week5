// lib/prisma.ts
import fs from "fs";
import path from "path";

type Todo = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  dueDate?: string | null;
  userId?: string | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const TODOS_FILE = path.join(DATA_DIR, "todos.json");

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  if (!fs.existsSync(TODOS_FILE)) {
    fs.writeFileSync(TODOS_FILE, JSON.stringify([]));
  }
}

function readTodos(): Todo[] {
  ensureFiles();
  try {
    const raw = fs.readFileSync(TODOS_FILE, "utf8");
    return JSON.parse(raw) as Todo[];
  } catch {
    return [];
  }
}

function writeTodos(todos: Todo[]) {
  ensureFiles();
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
}

function nowISO() {
  return new Date().toISOString();
}

export const prisma = {
  todo: {
    async findMany({ where, orderBy }: any = {}) {
      const todos = readTodos();
      let results = todos;
      if (where && where.userId !== undefined) {
        results = results.filter((t) => t.userId === where.userId);
      }
      if (orderBy && Array.isArray(orderBy)) {
        results = results.sort((a, b) => {
          for (const ord of orderBy) {
            const key = Object.keys(ord)[0];
            const dir = ord[key];
            const av = a[key];
            const bv = b[key];
            if (av < bv) return dir === "asc" ? -1 : 1;
            if (av > bv) return dir === "asc" ? 1 : -1;
          }
          return 0;
        });
      }
      return results;
    },

    async create({ data }: { data: Partial<Todo> }) {
      const todos = readTodos();
      const id = (typeof crypto !== "undefined" && (crypto as any).randomUUID)
        ? (crypto as any).randomUUID()
        : String(Date.now()) + Math.floor(Math.random() * 1000);
      const created = {
        id,
        title: data.title ?? "",
        description: data.description ?? null,
        completed: data.completed ?? false,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        dueDate: data.dueDate ?? null,
        userId: data.userId ?? null,
      };
      todos.push(created);
      writeTodos(todos);
      return created;
    },

    async findFirst({ where }: { where: any }) {
      const todos = readTodos();
      return todos.find((t) => {
        let ok = true;
        if (where?.id !== undefined) ok = ok && t.id === where.id;
        if (where?.userId !== undefined) ok = ok && t.userId === where.userId;
        return ok;
      });
    },

    async update({ where, data }: { where: any; data: Partial<Todo> }) {
      const todos = readTodos();
      const idx = todos.findIndex((t) => t.id === where.id);
      if (idx === -1) throw new Error("Not found");
      const updated = {
        ...todos[idx],
        ...data,
        updatedAt: nowISO(),
      };
      todos[idx] = updated;
      writeTodos(todos);
      return updated;
    },

    async updateMany({ where, data }: { where: any; data: Partial<Todo> }) {
      const todos = readTodos();
      let count = 0;
      for (let i = 0; i < todos.length; i++) {
        const matches =
          (where?.id === undefined || todos[i].id === where.id) &&
          (where?.userId === undefined || todos[i].userId === where.userId);
        if (matches) {
          todos[i] = { ...todos[i], ...data, updatedAt: nowISO() };
          count++;
        }
      }
      writeTodos(todos);
      return { count };
    },

    async delete({ where }: { where: any }) {
      const todos = readTodos();
      const newTodos = todos.filter((t) => t.id !== where.id);
      writeTodos(newTodos);
      return;
    },

    async deleteMany({ where }: { where: any }) {
      const todos = readTodos();
      const newTodos = todos.filter(
        (t) =>
          !(
            (where?.id === undefined || t.id === where.id) &&
            (where?.userId === undefined || t.userId === where.userId)
          )
      );
      writeTodos(newTodos);
      return { count: todos.length - newTodos.length };
    },
  },
};