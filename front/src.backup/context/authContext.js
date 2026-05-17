import { createContext, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};
export const AuthContextProvider = ({ children }) => {
  const parseJwt = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  const role = () => {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No access token found");
        }

        const decodedToken = parseJwt(token);
        const role = decodedToken.role;

        resolve(role);
      } catch (error) {
        console.error("Error fetching user role:", error);
        reject(error);
      }
    });
  };

  const name = () => {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No access token found");
        }

        const decodedToken = parseJwt(token);
        const name = decodedToken.name;

        resolve(name);
        
      } catch (error) {
        console.error("Error fetching user role:", error);
        reject(error);
      }
    });
  }
    
  const idUser = () => {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          resolve(0);
        }

        const decodedToken = parseJwt(token);
        const idUser = decodedToken.id;

        resolve(idUser);
        
      } catch (error) {
        console.error("Error fetching user role:", error);
        reject(error);
      }
    });

    
  };
  

  return (
    <AuthContext.Provider value={{ role , idUser,name }}>
      {children}
    </AuthContext.Provider>
  );
};
