import { AuthPage } from "pages/AuthPage";
import "./styles/index.scss";
import "./styles/reset.scss";
import "./styles/variables/global.scss"
import "./styles/themes/dark.scss"
import mammoth from "mammoth";
import { useEffect, useState } from "react";
import docxFile from "shared/assets/pdf/doc.docx";

const App = () => {
    const [htmlContent, setHtmlContent] = useState("");
    useEffect(() => {
        const fetchDocx = async () => {
            try {
                const response = await fetch(docxFile);
                const arrayBuffer = await response.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setHtmlContent(result.value); 
            } catch (e) {

            }
        }
        fetchDocx()
    }, [])
    return (
        <div className="app dark">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
    );
}

export default App;