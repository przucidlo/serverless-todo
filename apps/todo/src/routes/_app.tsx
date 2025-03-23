import { Box } from "@mui/material";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import { useAuth } from "react-oidc-context";
import { ProjectsBar } from "../modules/ProjectsBar/ProjectsBar";
import { projectsMembershipQueryOptions } from "../api/users/useProjectsMembershipQuery";
import { createBackendHttpClient } from "../api/useBackendHttpClient";
import { UserUnauthenticatedError } from "../errors/userUnauthenticatedError";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.auth.user) {
      throw new UserUnauthenticatedError();
    }

    return context.queryClient.ensureQueryData(
      projectsMembershipQueryOptions(
        createBackendHttpClient(context.auth.user, context.config)
      )
    );
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return "Pal, you're not authenticated";
  }

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" gap={1} width="100%">
        <ProjectsBar memberships={data} />
        <Outlet />
      </Box>
    </React.Fragment>
  );
}
