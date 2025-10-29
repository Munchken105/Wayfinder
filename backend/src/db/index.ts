import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

// Put the below in the .env file (just remember to replace with own local DB credentials)
// DATABASE_URL=postgresql://username:password@localhost:5432/wayfinder