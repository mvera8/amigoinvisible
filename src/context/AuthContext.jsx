import { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { account } from "../lib/appwrite";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage({
    key: "amigoinvisible_user",
    defaultValue: undefined,
  });

  const [loading, setLoading] = useState(true); // ← nuevo

  useEffect(() => {
    const init = async () => {
      // Si ya había usuario en localStorage → ya está cargado
      if (user !== undefined) {
        setLoading(false);
        return;
      }

      // Sino verificamos con Appwrite
      try {
        const res = await account.get();
        setUser(res);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, setUser]);

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

AuthProvider.propTypes = {
  children: PropTypes.node,
};
