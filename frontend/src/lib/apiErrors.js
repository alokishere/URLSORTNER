const statusMessages = {
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to do that.",
  404: "We could not find what you requested.",
  422: "Please check your entries and try again.",
  429: "Too many attempts. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again.",
  502: "The service is temporarily unavailable. Please try again.",
  503: "The service is temporarily unavailable. Please try again.",
};

const isSafeServerMessage = (value) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= 180 &&
  !/(stack|mongoose|mongodb|node_modules|e11000|internal server|\bat \w+\s*\()/i.test(value) &&
  !/^(unauthorized|forbidden|bad request|not found)$/i.test(value.trim());

export const getApiErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (error?.code === "ERR_CANCELED") return "Request cancelled.";
  if (!error?.response) return "Unable to connect. Check your internet connection and try again.";

  const status = error.response.status;
  const serverMessage = error.response.data?.error || error.response.data?.message;
  if (isSafeServerMessage(serverMessage)) return serverMessage;
  return statusMessages[status] || fallback;
};

export const getQueryErrorMessage = (error, fallback) =>
  getApiErrorMessage(error, fallback);
