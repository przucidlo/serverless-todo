import axios from "axios";
import { useAuth } from "react-oidc-context";
import { UserUnauthenticatedError } from "../errors/userUnauthenticatedError";
import { ConfigState, useConfig } from "../contexts/ConfigContext";
import { User } from "oidc-client-ts";

export function createBackendHttpClient(
  user: User,
  { backedUrl }: ConfigState
) {
  return axios.create({
    baseURL: backedUrl,
    headers: {
      Authorization: `Bearer ${user.access_token}`,
    },
  });
}

export function useBackendHttpClient() {
  const { isAuthenticated, user } = useAuth();
  const config = useConfig();

  if (!isAuthenticated || !user) {
    throw new UserUnauthenticatedError();
  }

  return createBackendHttpClient(user, config);
}
