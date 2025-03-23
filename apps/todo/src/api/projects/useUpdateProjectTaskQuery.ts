import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackendHttpClient } from "../useBackendHttpClient";
import { Task } from "../../common/interfaces/task";


export function useUpdateProjectTaskQuery(projectId: string) {
  const client = useBackendHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Task) => {
      return client.patch(`/api/v1/projects/${projectId}/tasks/${task.id}`, task)
    },
    mutationKey: ["project", "tasks", projectId],
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["project", "tasks", projectId] })
    },

  })
}
