import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { TErrorDataWithMessage } from "../types/response/auth";

export const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return "";

  if ("status" in error) {
    if (typeof error.data === "string") {
      return error.data;
    }

    if (
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data
    ) {
      return (error.data as TErrorDataWithMessage).message;
    }

    return `Error: ${error.status}`;
  }

  return error.message || "An unknown error occurred";
};

export const errorMessages = (errorType: string) => {
  switch (errorType) {
    case "account_inactive":
      return "Your account is inactive. Please contact your administrator to activate your account.";
    case "code_reused":
      return "Authentication code has been used. Please try logging in again.";
    case "token_or_profile":
    case "token_exchange_failed":
      return "Microsoft login failed. Please try again or contact support if the problem persists.";
    case "missing_parameters":
      return "Login failed due to missing parameters. Please try again.";
    case "invalid_state":
      return "Login failed due to invalid state. Please try again.";
    case "state_mismatch":
      return "Login failed due to state mismatch. Please try again.";
    case "role_not_found":
      return "Login failed due to missing user role. Please contact support.";
    case "oauth_error":
      return "Microsoft login failed. Please try again or contact support if the problem persists.";
    default:
      return `Login failed: ${errorType}. Please try again or contact support.`;
  }
};

// Helper function to get error type from URL
export const getErrorTypeFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("error");
};

// Helper function to display error with type
export const displayErrorWithType = (errorType: string): string => {
  const message = errorMessages(errorType);
  return `[${errorType}] ${message}`;
};

export const extractErrorMessage = (error: any) => {
  if (!error) return "Unknown error";
  
  // Check for nested error structure from backend: { error: { message: "...", type: "...", ... } }
  // RTK Query wraps this in error.data, so we check error.data.error.message
  if (error?.data?.error) {
    // If error.data.error is an object with a message property
    if (typeof error.data.error === "object" && error.data.error !== null) {
      if (error.data.error.message) {
        return error.data.error.message;
      }
    }
    // If error.data.error is a string, return it
    if (typeof error.data.error === "string") {
      return error.data.error;
    }
  }
  
  // Check for error.data.message (direct message in data)
  if (error?.data?.message) {
    return error.data.message;
  }
  
  // Check for error.error (direct error property)
  if (error?.error) {
    if (typeof error.error === "object" && error.error !== null) {
      if (error.error.message) {
        return error.error.message;
      }
    }
    if (typeof error.error === "string") {
      return error.error;
    }
  }
  
  // Check for error.message
  if (error?.message) {
    return error.message;
  }
  
  // Fallback to stringified error
  return JSON.stringify(error);
};
