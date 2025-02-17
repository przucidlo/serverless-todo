import { createContext, useContext } from "react";

export const ConfigContext = createContext<{
  backedUrl: string;
}>({
  backedUrl: "https://t551hiw9gj.execute-api.eu-west-1.amazonaws.com",
});

export function useConfig() {
  return useContext(ConfigContext);
}

export type ConfigState = ReturnType<typeof useConfig>;
