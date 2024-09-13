import { AuthPage } from "pages/AuthPage";
import "./styles/index.scss";
import "./styles/reset.scss";
import "./styles/variables/global.scss"
import "./styles/themes/dark.scss"


const App = () => {
    return (
        <div className="app dark">
            <AuthPage />
        </div>
    );
}

export default App;