import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { logger } from '../../../layers/logger.layer';
import { addProjectHandler } from './projects/add-project';
import { updateProjectHandler } from './projects/update-project';
import { deleteProjectHandler } from './projects/delete-project';
import { addProjectTaskHandler } from './projects/tasks/add-project-task';
import { getProjectTasksHandler } from './projects/tasks/get-project-tasks';
import { updateProjectTaskHandler } from './projects/tasks/update-project-task';
import { getUserProjectsHandler } from './users/projects/get-user-projects';

type RoutesRecord = {
    [key: string]: {
        handler: Handler<APIGatewayEvent, APIGatewayProxyResultV2>;
    }
}

const routes: RoutesRecord = {
    "POST /v1/projects": { handler: addProjectHandler },
    "PATCH /v1/projects/{projectId}": { handler: updateProjectHandler },
    "DELETE /v1/projects/{projectId}": { handler: deleteProjectHandler },
    "POST /v1/projects/{projectId}/tasks": { handler: addProjectTaskHandler },
    "GET /v1/projects/{projectId}/tasks": { handler: getProjectTasksHandler },
    "PATCH /v1/projects/{projectId}/tasks/{taskId}": { handler: updateProjectTaskHandler },
    "GET /v1/users/{userId}/projects": { handler: getUserProjectsHandler },
}

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context, callback) => {
    const route = routes[event.requestContext.resourceId];

    if (!route) {
        logger.error({ event }, 'Route defined in API Gateway, but not present in router');

        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Not found' }),
        }
    }

    // Cast because return of the route.handler is (void | Promise<...>), 
    // but this returns only the Promise<void | ...>.
    return <APIGatewayProxyResultV2>(route.handler(event, context, callback));
};
