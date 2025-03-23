import { createContext, useContext } from "react";

export const ConfigContext = createContext<{
  backedUrl: string;
}>({
  backedUrl: "https://c4ap2v95he.execute-api.eu-west-1.amazonaws.com",
});

export function useConfig() {
  return useContext(ConfigContext);
}

export type ConfigState = ReturnType<typeof useConfig>;
