import api from "./axios";

export const attachmentsApi = {
  list: (ticketId) => api.get(`/attachments/${ticketId}`),
  upload: (ticketId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/attachments/${ticketId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  remove: (id) => api.delete(`/attachments/${id}`),
  downloadUrl: (id) => `http://localhost:5000/api/attachments/download/${id}`,
};
