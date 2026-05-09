import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AUTH_API_BASE =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api/Auth";
const ACCESS_REFRESH_BUFFER_MS = 60_000;

export interface User {
  id?: string;
  username?: string;
  email?: string;
  roles?: string[];
  hasAssessment?: boolean;
  assessmentId?: number | null;
  patientId?: number | null;
  specialistId?: string | null;
  score?: number | null;
  isAuthenticated?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  login: (authData: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const applyAuthData = useCallback((authData: any) => {
    const accessToken: string | undefined = authData?.token;
    const refreshToken: string | undefined = authData?.refreshToken;

    if (!accessToken || !refreshToken) {
      return;
    }

    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    if (authData?.expiresOn) {
      localStorage.setItem("tokenExpiresOn", authData.expiresOn);
    }

    if (authData?.refreshTokenExpiration) {
      localStorage.setItem(
        "refreshTokenExpiration",
        authData.refreshTokenExpiration,
      );
    }

    const userObj: User = {
      id: authData.id,
      username: authData.username,
      email: authData.email,
      roles: authData.roles || [],
      hasAssessment: authData.hasAssessment || false,
      assessmentId: authData.assessmentId ? authData.assessmentId : null,
      patientId: authData.patientid || null,
      specialistId: authData.specialistid || null,
      score: authData.score || null,
      isAuthenticated: true,
    };

    localStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);
    setToken(accessToken);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to parse stored user data", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (authData: any) => {
    applyAuthData(authData);
  };

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      void fetch(`${AUTH_API_BASE}/revoke-token`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        keepalive: true,
      }).catch((error) => {
        console.error("Failed to revoke refresh token", error);
      });
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiresOn");
    localStorage.removeItem("refreshTokenExpiration");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const refreshTokenExpiration = localStorage.getItem("refreshTokenExpiration");

    if (!refreshToken) {
      logout();
      return;
    }

    if (refreshTokenExpiration) {
      const refreshTokenExpiryMs = Date.parse(refreshTokenExpiration);
      if (!Number.isNaN(refreshTokenExpiryMs) && Date.now() >= refreshTokenExpiryMs) {
        logout();
        return;
      }
    }

    try {
      const response = await fetch(`${AUTH_API_BASE}/refresh-token`, {
        method: "POST",
        headers: {
          Accept: "text/plain",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed (${response.status})`);
      }

      const responseBody = await response.json();
      if (responseBody?.success && responseBody?.data?.isAuthenticated) {
        applyAuthData(responseBody.data);
      } else {
        throw new Error(responseBody?.message || "Token refresh failed");
      }
    } catch (error) {
      console.error("Failed to refresh access token", error);
      logout();
    }
  }, [applyAuthData, logout]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const tokenExpiresOn = localStorage.getItem("tokenExpiresOn");
    if (!tokenExpiresOn) {
      return;
    }

    const tokenExpiryMs = Date.parse(tokenExpiresOn);
    if (Number.isNaN(tokenExpiryMs)) {
      return;
    }

    const timeoutMs = tokenExpiryMs - Date.now() - ACCESS_REFRESH_BUFFER_MS;
    if (timeoutMs <= 0) {
      void refreshSession();
      return;
    }

    const timerId = window.setTimeout(() => {
      void refreshSession();
    }, timeoutMs);

    return () => window.clearTimeout(timerId);
  }, [token, refreshSession]);

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
