import { createContext } from "react";
import { getUserPermissions } from "./PermissionUtils";

export const AuthContext = createContext({
  authState: {
    username: "",
    id: 0,
    role: "",
    permissions: {},
    status: false,
  },
  setAuthState: () => {},
  logout: () => {},
  isLoading: true,
});
