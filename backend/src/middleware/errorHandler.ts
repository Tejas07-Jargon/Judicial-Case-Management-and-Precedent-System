import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Global error handler middleware.
 * Ensures that stack traces, database credentials, and raw SQL queries are NEVER leaked.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  // Handle explicit AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Handle MySQL errors (identified by error.code or sqlState)
  const mysqlErr = err as any;

  // Handle ER_DUP_ENTRY (1062)
  if (mysqlErr.code === 'ER_DUP_ENTRY' || mysqlErr.errno === 1062) {
    res.status(409).json({
      error: {
        code: 'DUPLICATE_ENTITY',
        message: 'An entity with the specified identifier or unique combination already exists.',
      },
    });
    return;
  }

  // Handle ER_ROW_IS_REFERENCED_2 (1451) - Foreign key constraint fails on delete/update
  if (mysqlErr.code === 'ER_ROW_IS_REFERENCED_2' || mysqlErr.errno === 1451) {
    res.status(409).json({
      error: {
        code: 'FOREIGN_KEY_CONFLICT',
        message: 'Cannot delete or update entity because dependent records reference it.',
      },
    });
    return;
  }

  // Handle ER_NO_REFERENCED_ROW_2 (1452) - Foreign key constraint fails on insert/update
  if (mysqlErr.code === 'ER_NO_REFERENCED_ROW_2' || mysqlErr.errno === 1452) {
    res.status(400).json({
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'A referenced parent entity (e.g. Case, Defendant, Incident, or Charge) does not exist.',
      },
    });
    return;
  }

  if (mysqlErr.sqlState) {
    // Custom SIGNAL SQLSTATE '45000' from stored procedures
    if (mysqlErr.sqlState === '45000') {
      const msg: string = mysqlErr.message || '';
      const isNotFound = msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('not registered');
      const statusCode = isNotFound ? 404 : 400;
      const code = isNotFound ? 'RESOURCE_NOT_FOUND' : 'PROCEDURE_VALIDATION_ERROR';

      res.status(statusCode).json({
        error: {
          code,
          message: msg,
        },
      });
      return;
    }

    // Other database connection or syntax errors
    res.status(503).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'The database service encountered an issue processing the request.',
      },
    });
    return;
  }

  // Handle connection refused / ECONNREFUSED
  if (mysqlErr.code === 'ECONNREFUSED' || mysqlErr.code === 'PROTOCOL_CONNECTION_LOST') {
    res.status(503).json({
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database connection is currently unavailable.',
      },
    });
    return;
  }

  // Default internal server error
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred.',
    },
  });
}
