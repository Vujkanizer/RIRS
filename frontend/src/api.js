export async function api(path, options = {}) {
  const headers = { ...options.headers };
  const token = localStorage.getItem("token");
  if (options.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    throw new Error("Morate biti prijavljeni.");
  }
  if (!response.ok) {
    throw new Error(data.napaka || "Napaka.");
  }
  return data;
}
