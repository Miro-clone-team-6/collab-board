import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

async function setupDatabaseConfig(t, { apiEnv, rootEnv }) {
  // У каждого теста свои .env, поэтому локальные настройки разработчика не влияют на результат.
  const root = await mkdtemp(join(tmpdir(), "collab-board-db-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const api = join(root, "apps/api");
  const config = join(api, "dist/config");
  await mkdir(config, { recursive: true });

  // package.json включает режим ES-модулей для собранных .js, а ссылка на node_modules даёт им доступ к dotenv.
  await writeFile(join(api, "package.json"), '{"type":"module"}');
  await symlink(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    join(api, "node_modules"),
    "junction",
  );

  // Копируем модули во временный проект, потому что они ищут .env относительно своего расположения.
  for (const file of ["database-url.js", "env-file.js"]) {
    await cp(new URL(`../dist/config/${file}`, import.meta.url), join(config, file));
  }
  if (apiEnv !== undefined) await writeFile(join(api, ".env"), apiEnv);
  if (rootEnv !== undefined) await writeFile(join(root, ".env"), rootEnv);

  const { resolveDatabaseUrl } = await import(pathToFileURL(join(config, "database-url.js")).href);
  return { resolveDatabaseUrl, api };
}

test("DATABASE_URL from the process takes precedence over apps/api/.env", async (t) => {
  const fileUrl = "postgresql://localhost:6543/api_env";
  const processUrl = "postgresql://localhost:6544/process_env";
  const { resolveDatabaseUrl } = await setupDatabaseConfig(t, {
    apiEnv: `DATABASE_URL=${fileUrl}\n`,
    rootEnv: "POSTGRES_PORT=55432\n",
  });

  assert.equal(resolveDatabaseUrl({ DATABASE_URL: processUrl }), processUrl);
});

test("DATABASE_URL from apps/api/.env takes precedence over root PostgreSQL settings", async (t) => {
  const fileUrl = "postgresql://localhost:6543/api_env";
  const { resolveDatabaseUrl } = await setupDatabaseConfig(t, {
    apiEnv: `DATABASE_URL=${fileUrl}\n`,
    rootEnv: "POSTGRES_PORT=55432\n",
  });

  assert.equal(resolveDatabaseUrl({}), fileUrl);
});

test("builds a host URL from root PostgreSQL settings and encodes the password", async (t) => {
  const { resolveDatabaseUrl } = await setupDatabaseConfig(t, {
    apiEnv: "",
    rootEnv: "POSTGRES_PORT=55432\nPOSTGRES_PASSWORD='test$pass:@#'\n",
  });

  const url = new URL(resolveDatabaseUrl({}));
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.port, "55432");
  assert.equal(decodeURIComponent(url.password), "test$pass:@#");
});

test("POSTGRES_PASSWORD from the process overrides the root .env password", async (t) => {
  const { resolveDatabaseUrl } = await setupDatabaseConfig(t, {
    apiEnv: "",
    rootEnv: "POSTGRES_PASSWORD=from-file\n",
  });

  const url = new URL(resolveDatabaseUrl({ POSTGRES_PASSWORD: "from-process" }));
  assert.equal(url.password, "from-process");
});

test("an empty POSTGRES_PORT in the process selects the Compose default", async (t) => {
  const { resolveDatabaseUrl } = await setupDatabaseConfig(t, {
    apiEnv: "",
    rootEnv: "POSTGRES_PORT=55432\n",
  });

  assert.equal(new URL(resolveDatabaseUrl({ POSTGRES_PORT: "" })).port, "5432");
});

test("missing env files select the default host database URL", async (t) => {
  const { resolveDatabaseUrl } = await setupDatabaseConfig(t, {});

  assert.equal(
    resolveDatabaseUrl({}),
    "postgresql://postgres:postgres@127.0.0.1:5432/collab_board?schema=public",
  );
});

test("Prisma config loads API env settings before resolving the database URL", async (t) => {
  const { api } = await setupDatabaseConfig(t, {
    apiEnv: "POSTGRES_PORT=6545\nPGSSLMODE=require\n",
    rootEnv: "POSTGRES_PORT=55432\n",
  });
  await cp(new URL("../src/config/", import.meta.url), join(api, "src/config"), {
    recursive: true,
  });
  await cp(new URL("../prisma.config.ts", import.meta.url), join(api, "prisma.config.ts"));

  const environment = { ...process.env };
  for (const key of Object.keys(environment)) {
    if (key === "DATABASE_URL" || key.startsWith("POSTGRES_") || key === "PGSSLMODE") {
      delete environment[key];
    }
  }

  const output = execFileSync(
    process.execPath,
    [
      "--import",
      import.meta.resolve("tsx"),
      "--input-type=module",
      "-e",
      `const { default: config } = await import('./prisma.config.ts');
       console.log(JSON.stringify({
         port: new URL(config.datasource.url).port,
         ssl: process.env.PGSSLMODE,
       }));`,
    ],
    { cwd: api, env: environment, encoding: "utf8" },
  );
  assert.deepEqual(JSON.parse(output.trim()), { port: "6545", ssl: "require" });
});
