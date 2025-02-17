import { Avatar, Box, IconButton } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { ProjectMembership } from "../../common/interfaces/projectMembership";

interface Props {
  memberships: ProjectMembership[];
}

export function ProjectsBar({ memberships }: Props) {
  return (
    <Box
      sx={(theme) => ({
        width: theme.spacing(8),
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.grey[100],
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: theme.spacing(2),
      })}
    >
      {memberships.map((membership) => (
        <Link
          from="/app/projects/*"
          to="/app/projects/$projectId"
          params={{ projectId: membership.project.id }}
        >
          <IconButton key={membership.project.id}>
            <Avatar>{membership.project.name[0]}</Avatar>
          </IconButton>
        </Link>
      ))}

      <IconButton key="create-project">
        <Avatar color="red">+</Avatar>
      </IconButton>
    </Box>
  );
}
