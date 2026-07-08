import { apiClient } from "./client";

export interface AuthStatus {
  authRequired: boolean;
  authenticated: boolean;
}

export const authApi = {
  getStatus: () => apiClient.get<AuthStatus>("/auth/status"),
  login: (password: string) => apiClient.post<{ ok: boolean }>("/auth/login", { password }),
  logout: () => apiClient.post<{ ok: boolean }>("/auth/logout"),
};
