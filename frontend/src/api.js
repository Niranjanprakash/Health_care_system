const BASE = process.env.REACT_APP_API_URL || "";

export function getToken() {
  return localStorage.getItem("hc_token");
}

export function setToken(token) {
  localStorage.setItem("hc_token", token);
}

export function clearToken() {
  localStorage.removeItem("hc_token");
  localStorage.removeItem("hc_user");
  localStorage.removeItem("hc_role");
}

export function setAuth(user, role, token) {
  localStorage.setItem("hc_token", token);
  localStorage.setItem("hc_user", user);
  localStorage.setItem("hc_role", role);
}

export function getAuth() {
  return {
    token: localStorage.getItem("hc_token"),
    user:  localStorage.getItem("hc_user"),
    role:  localStorage.getItem("hc_role"),
  };
}

function headers() {
  const token = getToken();
  const h = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: headers() });
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export function apiDownload(path) {
  const token = getToken();
  const url = `${BASE}${path}`;
  const a = document.createElement("a");
  a.href = url;
  // Append token as query param for file download
  a.href = `${url}?token=${token}`;
  a.download = "expenses.csv";
  a.click();
}
