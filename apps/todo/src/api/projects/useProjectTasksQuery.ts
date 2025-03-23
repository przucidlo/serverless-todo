import { queryOptions, useQuery } from "@tanstack/react-query";
import { useBackendHttpClient } from "../useBackendHttpClient";
import { AxiosInstance, AxiosResponse } from "axios";
import { Task } from "../../common/interfaces/task";
import { TaskStatus } from "../../common/interfaces/taskStatus";

type Response = AxiosResponse<{
  data: Task[];
}>;

export const projectTasksQueryOptions = (client: AxiosInstance, projectId: string) =>
  queryOptions({
    queryKey: ["project", "tasks", projectId],
    queryFn: () =>
      client
        .get<unknown, Response>(`/api/v1/projects/${projectId}/tasks`)
        .then((res) => res.data.data.reduce((prev, curr) => {
          if (!prev[curr.status]) {
            prev[curr.status] = [];
          }

          prev[curr.status].push(curr)

          return prev;
        }, <Record<TaskStatus, Task[]>>{})),
    initialData: <Record<TaskStatus, Task[]>>{},
  });

export function useProjectTasksQuery(projectId: string) {
  const client = useBackendHttpClient();

  return useQuery(projectTasksQueryOptions(client, projectId));
}
