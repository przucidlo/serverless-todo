import { queryOptions, useQuery } from "@tanstack/react-query";
import { useBackendHttpClient } from "../useBackendHttpClient";
import { AxiosInstance, AxiosResponse } from "axios";
import { ProjectMembership } from "../../common/interfaces/projectMembership";

type Response = AxiosResponse<{
  data: ProjectMembership[];
}>;

export const projectsMembershipQueryOptions = (client: AxiosInstance) =>
  queryOptions({
    queryKey: ["users", "@me", "projects"],
    queryFn: () =>
      client
        .get<unknown, Response>("/api/v1/users/@me/projects")
        .then((res) => res.data.data),
  });

export function useProjectsMembershipQuery() {
  const client = useBackendHttpClient();

  return useQuery(projectsMembershipQueryOptions(client));
}
