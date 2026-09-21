// A tiny helper so every component doesn't repeat the same
// "attach the token, handle the error" boilerplate on every fetch call.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const apiFetch = async (path, options = {}) => {
  const stored = localStorage.getItem("revlyUser");
  const token = stored ? JSON.parse(stored).token : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
  const error = new Error(
    data.message || "Something went wrong"
  );

  error.status = res.status;
  error.product = data.product;

  throw error;
}
  return data;
};

export const uploadAvatar = async (userId, file) => {
  const stored = localStorage.getItem("revlyUser");
  const token = stored
    ? JSON.parse(stored).token
    : null;

  const formData = new FormData();

  formData.append("avatar", file);

  const res = await fetch(
    `${API_URL}/users/${userId}/avatar`,
    {
      method: "PUT",
      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: formData, // but not "Content-Type": "multipart/form-data" because The browser automatically creates the correct multipart boundary. 
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Failed to upload profile photo"
    );
  }

  return data;
};

export const removeAvatar = async (userId) => {
  const stored = localStorage.getItem("revlyUser");

  const token = stored
    ? JSON.parse(stored).token
    : null;

  const res = await fetch(
    `${API_URL}/users/${userId}/avatar`,
    {
      method: "DELETE",
      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Failed to remove profile photo"
    );
  }

  return data;
};
