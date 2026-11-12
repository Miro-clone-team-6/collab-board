import { STATUS_CODES } from "node:http";
import { type ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { BaseExceptionFilter, HttpAdapterHost } from "@nestjs/core";
import { ApplicationError } from "./application.error.js";
import { applicationErrorStatuses } from "./application-error-statuses.js";

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(adapterHost: HttpAdapterHost) {
    super(adapterHost.httpAdapter);
  }

  override catch(exception: unknown, host: ArgumentsHost): void {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof ApplicationError) {
      const mappedStatus = applicationErrorStatuses.get(exception.code);
      if (mappedStatus !== undefined && mappedStatus >= 400 && mappedStatus < 500) {
        super.catch(
          new HttpException(
            { statusCode: mappedStatus, error: exception.code, message: exception.message },
            mappedStatus,
          ),
          host,
        );
        return;
      }
    } else if (exception instanceof HttpException || this.isHttpError(exception)) {
      const httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : (exception as { statusCode: number }).statusCode;

      if (httpStatus >= 400 && httpStatus < 500) {
        super.catch(exception, host);
        return;
      }
      if (httpStatus >= 500 && httpStatus < 600) status = httpStatus;
    }

    this.logger.error(exception);
    super.catch(
      new HttpException({ statusCode: status, message: STATUS_CODES[status] }, status),
      host,
    );
  }
}
