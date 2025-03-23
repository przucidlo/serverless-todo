import { Divider, Paper, Stack, Typography } from "@mui/material";
import { TaskProps } from "./Task";
import { ReactElement } from "react";
import { useDroppable } from "@dnd-kit/core";
import { TaskStatus } from "../../common/interfaces/taskStatus";

const LABELS: Record<TaskStatus, string> = {
  [TaskStatus.NEW]: "New",
  [TaskStatus.IN_PROGRESS]: "In-Progress",
  [TaskStatus.DONE]: "Done"
}

interface Props {
  status: TaskStatus,
  children: ReactElement<TaskProps>[] | ReactElement<TaskProps>;
}

export function TasksContainer({ status, children }: Props) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        padding: theme.spacing(1),
        minWidth: 300,
        minHeight: 128,
      })}
      ref={setNodeRef}
    >
      <Typography noWrap variant="overline">
        {LABELS[status]}
      </Typography>
      <Stack gap={1}>
        <Divider />
        {children}
      </Stack>
    </Paper>
  );
}
