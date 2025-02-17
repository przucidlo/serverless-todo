import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/app/projects/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();

  return <div>test "/app/projects/{projectId}!</div>;
}
