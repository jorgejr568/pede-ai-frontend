import { createContext, useContext, useEffect, useRef, useState } from "react";
import uniqid from "uniqid";
type SessionContextType = {
  sessionID: string;
};

export const SessionContext = createContext<SessionContextType>({
  sessionID: "",
});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sessionID, setSessionID] = useState<string>("");
  useEffect(() => {
    const hasCookie = document.cookie.includes("session_id");
    if (hasCookie) {
      const sessionID = document.cookie
        .split("; ")
        .find((row) => row.startsWith("session_id"))
        ?.split("=")[1];
      if (sessionID) {
        setSessionID(sessionID);
      }

      return;
    }

    const newSessionID = uniqid();
    document.cookie = `session_id=${newSessionID}`;
    setSessionID(newSessionID);
  }, []);

  return (
    <SessionContext.Provider value={{ sessionID }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  return useContext(SessionContext);
};
