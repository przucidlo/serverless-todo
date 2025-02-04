import { ProjectDTO } from '../dto/project-dto';
import { Event } from '../interfaces/event-publisher.interface';

export type UpdateProjectMembersEvent = Event<
  'update-project-members',
  ProjectDTO
>;
