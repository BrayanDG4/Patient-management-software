import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorPage } from "./pages/ErrorPage.jsx";

import { PatientList } from "./pages/PatientList.jsx";
import { WaitingRoom } from "./pages/WaitingRoom.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/pacientes",
    element: <PatientList />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/sala-de-espera",
    element: <WaitingRoom />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
