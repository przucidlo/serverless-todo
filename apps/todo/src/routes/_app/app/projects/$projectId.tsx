import { createFileRoute } from "@tanstack/react-router";
import { TasksContainer } from "../../../../modules/TasksContainer/TasksContainer";
import { Task } from "../../../../modules/TasksContainer/Task";
import { Task as TaskInterface } from "../../../../common/interfaces/task";
import { TaskStatus, toTaskStatus } from "../../../../common/interfaces/taskStatus";
import { Box, Stack, useTheme } from "@mui/material";
import { DndContext } from "@dnd-kit/core";
import { useProjectTasksQuery } from "../../../../api/projects/useProjectTasksQuery";
import { useUpdateProjectTaskQuery } from "../../../../api/projects/useUpdateProjectTaskQuery";

export const Route = createFileRoute("/_app/app/projects/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();

  const tasks = useProjectTasksQuery(projectId);
  const { mutate } = useUpdateProjectTaskQuery(projectId)
  const theme = useTheme();

  if (tasks.isLoading) {
    return "Loading...";
  }

  return (
    <DndContext onDragEnd={(event) => {
      if (!event.over) {
        return;
      }

      const task: TaskInterface = event.active.data.current;

      mutate({ ...task, status: toTaskStatus(event.over.id.toString()) })
    }}>
      <Box overflow="auto" width="100%">
        <Stack direction="row" paddingY={theme.spacing(1)} gap={2}>
          {Object.values(TaskStatus).map(status => (
            <TasksContainer status={status}>
              {(tasks.data[status] ?? []).map(task => <Task {...task} />)}
            </TasksContainer>
          ))}
        </Stack>
      </Box>
    </DndContext >
  );
}
