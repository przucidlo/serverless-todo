import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "react-oidc-context";
import { Router } from "./Router";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_OM1hxkZx1",
  client_id: "1399h9j4sa1h4k3psmh8ud7b3a",
  redirect_uri: "http://localhost:5173/app",
  response_type: "code",
  scope: "email openid phone",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CssBaseline />
    <AuthProvider {...cognitoAuthConfig}>
      <Router />
    </AuthProvider>
  </StrictMode>
);
