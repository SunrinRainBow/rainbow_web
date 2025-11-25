import { createBrowserRouter } from "react-router-dom";

import { Home, Type, Profile, About, AuthCallback } from "@/pages";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/type",
    element: <Type />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
]);

export default Router;
