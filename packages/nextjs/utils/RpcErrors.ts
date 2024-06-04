import { INTERNAL_ERROR, SERVER_ERROR } from "./rpc-errors/constants";
import { getError, getErrorByCode, isReservedErrorCode, isServerErrorCode } from "./rpc-errors/error";
import { ErrorResponse } from "./rpc-errors/types";

export function formatErrorMessage(error?: string | ErrorResponse): ErrorResponse {
  if (typeof error === "undefined") {
    return getError(INTERNAL_ERROR);
  }
  if (typeof error === "string") {
    error = {
      ...getError(SERVER_ERROR),
      message: error,
    };
  }
  if (isReservedErrorCode(error.code)) {
    error = getErrorByCode(error.code);
  }
  if (!isServerErrorCode(error.code)) {
    throw new Error("Error code is not in server code range");
  }
  return error;
}

export function errorResponse(id: number, error?: string | ErrorResponse) {
  return {
    id,
    jsonrpc: "2.0",
    error: formatErrorMessage(error),
  };
}
