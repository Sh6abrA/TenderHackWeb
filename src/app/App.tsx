import "./styles/index.scss";
import "./styles/reset.scss";
import "./styles/variables/global.scss"
import "./styles/themes/dark.scss"
import mammoth from "mammoth";
import { useEffect, useState } from "react";
import { MainPage } from "pages/MainPage";
import { InfoPage } from "pages/InfoPage/ui/InfoPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
const router = createBrowserRouter([
    {
        path: "/",
        element: <MainPage/>
    },
    {
        path: "/info",
        element: <InfoPage/>
    }
])
const App = () => {
  
    return (
        <div className="app">
            <RouterProvider router={router}/>
        </div>
    );
}

export default App;