import instance from "../axios";

export const createShortUrl = async (payload) => {
  const response = await instance.post("/urls/", payload);
  return response.data;
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
