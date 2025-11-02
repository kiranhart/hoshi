import { env } from "@/env/server";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

// Create a connection pool for better performance
const pool = mysql.createPool(env.DATABASE_URL);

const db = drizzle(pool);

export default db;