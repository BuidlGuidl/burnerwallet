export interface ErrorResponse {
  code: number;
  message: string;
  data?: string;
}

export interface JsonRpcError {
  id: number;
  jsonrpc: string;
  error: ErrorResponse;
}

export interface JsonRpcValidationResult {
  valid: boolean;
  error?: string;
}

export interface JsonRpcValidationValid extends JsonRpcValidationResult {
  valid: true;
}

export interface JsonRpcValidationInvalid extends JsonRpcValidationResult {
  valid: false;
  error: string;
}

export type JsonRpcValidation = JsonRpcValidationValid | JsonRpcValidationInvalid;
