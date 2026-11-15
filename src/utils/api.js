
const API_URL = "http://localhost:5000";

export const apiFetch = async (endpoint, options = {}) => {
  const savedAdmin = JSON.parse(
    localStorage.getItem("fitzoneAdmin") || "null"
  );

  const token = savedAdmin?.token;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (response.status === 401) {
    localStorage.removeItem("fitzoneAdmin");
    window.location.reload();
  }

  return response;
};
