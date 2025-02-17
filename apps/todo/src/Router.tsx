import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigState, useConfig } from "./contexts/ConfigContext";

import { AuthState, useAuth } from "react-oidc-context";

export type RouterContext = {
  queryClient: QueryClient;
  auth: AuthState;
  config: ConfigState;
};

const queryClient = new QueryClient();

const context: RouterContext = {
  queryClient,
  auth: undefined!,
  config: undefined!,
};

const router = createRouter({
  routeTree,
  context,
  Wrap: ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function Router() {
  const auth = useAuth();
  const config = useConfig();

  if (auth.isLoading) {
    return <div>Loading..</div>;
  }

  return (
    <RouterProvider router={router} context={{ queryClient, auth, config }} />
  );
}
