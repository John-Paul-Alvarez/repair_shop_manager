import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
  status;
  fields;
}
async function api(path, body) {
  let response;
  try {
    response = await fetch("/api" + path, {
      method: body === undefined ? "GET" : "POST",
      credentials: "include",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new ApiError(
      "We couldn’t reach the server. Check your connection and try again.",
      0,
    );
  }
  const data =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      data?.error?.message ?? "The service is unavailable. Please try again.",
      response.status,
      data?.error?.fields,
    );
  return data;
}
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAccount(await api("/auth/me"));
    } catch (error2) {
      if (error2 instanceof ApiError && error2.status === 401) setAccount(null);
      else
        setError(
          error2 instanceof Error
            ? error2.message
            : "Unable to load your workspace.",
        );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return (
    <AuthContext.Provider
      value={{ account, loading, error, setAccount, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}
function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is required.");
  return value;
}
const destination = (account) =>
  account.shop ? "/work-orders" : "/setup/shop";
export { ApiError, AuthProvider, api, destination, useAuth };
