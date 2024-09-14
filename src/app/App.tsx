import "./styles/index.scss";
import "./styles/reset.scss";
import "./styles/variables/global.scss"
import "./styles/themes/dark.scss"
import mammoth from "mammoth";
import { useEffect, useState } from "react";
import { MainPage } from "pages/MainPage";
const App = () => {
  
    return (
        <div className="app">
            <MainPage/>
        </div>
    );
}

export default App;