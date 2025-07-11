import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("username");

    if (storedToken && storedUser) {
      try {
        setUser({
          username: storedUser,
          token: storedToken,
        });
      } catch (err) {
        console.error("Failed to parse user:", err);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = JSON.stringify({
      username: username,
      password: password,
    });
    const loginResponse = await axios.post(BASE_URL + "/v1/auth/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const loggedInUser = {
      username: username,
      token: loginResponse.data.access_token,
    };
    localStorage.setItem("token", loggedInUser.token);
    localStorage.setItem("username", loggedInUser.username);
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
