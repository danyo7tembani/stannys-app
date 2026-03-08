import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { UsersData, UserRole } from "./types.js";

const FILE_NAME = "users.json";

const DEFAULT_USERS: UsersData = {
  admin: { password: "admin" },
  editeur: { password: "admin" },
  lecteur: { password: "admin" },
  atelier: { password: "admin" },
};

function getFilePath(dataDir: string): string {
  return path.join(dataDir, FILE_NAME);
}

async function ensureDataDir(dataDir: string): Promise<void> {
  try {
    await mkdir(dataDir, { recursive: true });
  } catch {
    // ignore
  }
}

export function createUsersFileStore(dataDir: string) {
  const filePath = getFilePath(dataDir);

  async function read(): Promise<UsersData> {
    await ensureDataDir(dataDir);
    try {
      const raw = await readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as Partial<UsersData>;
      return {
        admin: data.admin ?? DEFAULT_USERS.admin,
        editeur: data.editeur ?? DEFAULT_USERS.editeur,
        lecteur: data.lecteur ?? DEFAULT_USERS.lecteur,
        atelier: data.atelier ?? DEFAULT_USERS.atelier,
      };
    } catch {
      return { ...DEFAULT_USERS };
    }
  }

  async function write(data: UsersData): Promise<void> {
    await ensureDataDir(dataDir);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  return {
    async verify(role: string, password: string): Promise<boolean> {
      const data = await read();
      const r = role as UserRole;
      if (r !== "admin" && r !== "editeur" && r !== "lecteur" && r !== "atelier") return false;
      return data[r].password === password;
    },

    async setPassword(role: UserRole, password: string): Promise<void> {
      const data = await read();
      data[role] = { password };
      await write(data);
    },

    async getRoles(): Promise<UserRole[]> {
      return ["admin", "editeur", "lecteur", "atelier"];
    },
  };
}
