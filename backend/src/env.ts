import dotenv from "dotenv";
import path from "path";

// repo-root .env first, then backend/.env (backend overrides if present)
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ override: true });