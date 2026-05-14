import {
  createContext,
  useContext
} from "react";

const SalesContext = createContext();

export function SalesProvider({
  children,
  value
}) {

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSalesContext() {

  const context =
    useContext(SalesContext);

  if (!context) {

    throw new Error(
      "useSalesContext must be used inside SalesProvider"
    );
  }

  return context;
}