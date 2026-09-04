// ============================================================
// PATTERNIQ API CLIENT
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

const BASE_URL = typeof window !== "undefined" ? "/api/v1" : "http://localhost:3000/api/v1";

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith("/") ? `${BASE_URL}${endpoint}` : `${BASE_URL}/${endpoint}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("patterniq_access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await res.json().catch(() => ({
      success: false,
      error: { code: "INVALID_JSON", message: "Failed to parse response" },
    }));

    // Handle token refresh on 401 if refreshToken exists
    if (res.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("patterniq_refresh_token");
      if (refreshToken && !endpoint.includes("/auth/refresh")) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.data?.accessToken) {
            localStorage.setItem("patterniq_access_token", refreshData.data.accessToken);
            headers["Authorization"] = `Bearer ${refreshData.data.accessToken}`;
            const retryRes = await fetch(url, { ...options, headers });
            return await retryRes.json();
          } else {
            localStorage.removeItem("patterniq_access_token");
            localStorage.removeItem("patterniq_refresh_token");
            localStorage.removeItem("patterniq_user");
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("patterniq:auth_expired"));
            }
          }
        } catch {
          // Ignore refresh error
        }
      }
    }

    return data;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: err.message || "Network request failed",
      },
    };
  }
}
