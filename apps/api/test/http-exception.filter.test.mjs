import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { BadRequestException, Controller, Get } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { ApplicationError } from "../dist/errors/application.error.js";
import { applicationErrorStatuses } from "../dist/errors/application-error-statuses.js";
import { HttpExceptionFilter } from "../dist/errors/http-exception.filter.js";
import { HealthController } from "../dist/modules/health/health.controller.js";
import { HealthService } from "../dist/modules/health/health.service.js";

test("global HTTP exception handling", async (t) => {
  let failure;
  const logs = [];
  const logger = {
    log() {},
    warn() {},
    error(...args) {
      logs.push(args);
    },
  };

  class ProbeController {
    check() {
      throw failure;
    }
  }
  Controller("probe")(ProbeController);
  Get()(
    ProbeController.prototype,
    "check",
    Object.getOwnPropertyDescriptor(ProbeController.prototype, "check"),
  );

  class TestNotFoundError extends ApplicationError {
    code = "TEST_NOT_FOUND";
  }

  const module = await Test.createTestingModule({
    controllers: [ProbeController, HealthController],
    providers: [
      { provide: APP_FILTER, useClass: HttpExceptionFilter },
      { provide: HealthService, useValue: { check: () => ({ status: "invalid" }) } },
    ],
  })
    .setLogger(logger)
    .compile();
  const app = module.createNestApplication({ logger });
  await app.listen(0, "127.0.0.1");
  t.after(() => app.close());
  const url = await app.getUrl();

  async function request(path = "/probe") {
    const response = await fetch(url + path);
    return { status: response.status, body: await response.json() };
  }

  await t.test(
    "registered application error exposes only its public code and message",
    async () => {
      applicationErrorStatuses.set("TEST_NOT_FOUND", 404);
      try {
        failure = new TestNotFoundError("Resource not found", {
          cause: new Error("PRIVATE_CAUSE"),
        });
        assert.deepEqual(await request(), {
          status: 404,
          body: { statusCode: 404, error: "TEST_NOT_FOUND", message: "Resource not found" },
        });
      } finally {
        applicationErrorStatuses.delete("TEST_NOT_FOUND");
      }
    },
  );

  await t.test("unexpected error is redacted and logged", async () => {
    failure = new Error("PRIVATE_MESSAGE", { cause: new Error("PRIVATE_CAUSE") });
    assert.deepEqual(await request(), {
      status: 500,
      body: { statusCode: 500, message: "Internal Server Error" },
    });
    assert(logs.some((args) => args.includes(failure)));
  });

  await t.test("Nest 4xx validation response is preserved", async () => {
    failure = new BadRequestException(["email must be valid"]);
    assert.deepEqual(await request(), { status: 400, body: failure.getResponse() });
  });

  await t.test("Zod response validation errors stay private", async () => {
    assert.deepEqual(await request("/health"), {
      status: 500,
      body: { statusCode: 500, message: "Internal Server Error" },
    });
  });
});
