import { createFileRoute } from "@tanstack/react-router";
import { useProjectsMembershipQuery } from "../../../../api/users/useProjectsMembershipQuery";

export const Route = createFileRoute("/_app/app/projects/*")({
  component: RouteComponent,
});

function RouteComponent() {
  const projects = useProjectsMembershipQuery();

  if (projects.isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Create your project: {JSON.stringify(projects.data)}</div>;
}
