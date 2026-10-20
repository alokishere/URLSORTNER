import instance from "../axios";

export const getRequestErrorMessage = (error, fallback) =>
  error?.response?.data?.error ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export const createShortUrl = async (payload) => {
  const response = await instance.post("/urls/", payload);
  const created = response.data;
  const hasShortUrl = typeof created?.shortUrl === "string" || typeof created?.url === "string";
  if (response.status !== 201 || typeof created?.shortID !== "string" || !hasShortUrl) {
    throw new Error("The server returned an invalid link response.");
  }
  return created;
};

export const claimGuestLinks = async (claims) => {
  const response = await instance.post("/urls/claim", { claims });
  return response.data;
};

export const updateShortUrl = async (id, payload) => {
  const response = await instance.patch(`/urls/${id}`, payload);
  return response.data;
};

export const updateShortUrlStatus = async (id, status) => {
  const response = await instance.patch(`/urls/${id}/status`, { status });
  return response.data;
};

export const deleteShortUrl = async (id) => {
  const response = await instance.delete(`/urls/${id}`);
  return response.data;
};

export const fetchShortUrlQrCode = async (id) => {
  const response = await instance.get(`/urls/${id}/qr`);
  return response.data;
};
