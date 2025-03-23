import { Box, IconButton, Paper, Typography } from "@mui/material";
import { Task as TaskInterface } from "../../common/interfaces/task";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useDraggable } from "@dnd-kit/core";

export type TaskProps = TaskInterface;

export function Task({ title, description, owner, status, id }: TaskProps) {
  const { setNodeRef, listeners, attributes, transform } = useDraggable({
    id,
    data: { title, description, owner, id, status }
  });

  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        padding: theme.spacing(1),
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      })}
      ref={setNodeRef}
      key={id}
      {...listeners}
      {...attributes}
    >
      <Box display="flex" alignItems="center">
        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton size="small">
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Typography variant="body2">{description}</Typography>
      <Typography variant="caption">
        Assigne: {owner !== undefined ? owner : "None"}
      </Typography>
    </Paper>
  );
}
