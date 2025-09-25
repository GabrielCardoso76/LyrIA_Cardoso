// src/routes/routesConfig.js
import Home from "../pages/InitialScreen";
import RegistrationAndLogin from "../pages/RegistrationAndLoginScreen";
import Chat from "../pages/ChatScreen";
import LoadingScreen from "../components/LoadingScreen";
import ImageGenerationScreen from "../pages/ImageGenerationScreen";


export const routes = [
  {
    path: "/",
    name: "Home",
    element: <Home />,
  },
  
  {
    path: "/RegistrationAndLogin",
    name: "RegistrationAndLogin",
    element: <RegistrationAndLogin />,
  },

  {
    path: "/chat",
    name: "Chat",
    element: <Chat />,
  },
  {
    path: "/loading",
    name: "LoadingScreen",
    element: <LoadingScreen/>,
  },
  {
    path: "/gerar-imagem",
    name: "ImageGeneration",
    element: <ImageGenerationScreen />,
  }
];