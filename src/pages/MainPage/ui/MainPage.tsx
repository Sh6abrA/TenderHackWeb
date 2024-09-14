import { Header } from 'widgets/Header';
import * as cls from './MainPage.module.scss';
import { DocumentType, DocumentViewer } from 'widgets/DocumentViewer';
import { createRef, useEffect, useState } from 'react';
import * as Diff from 'diff';
interface MainPageProps {
    className?: string
}

export const MainPage = ({className}: MainPageProps) => {
    const [currentHtml, setCurrentHtml] = useState("");
    const [previousHTML, setPreviousHTML] = useState("");
    const [highlightedPreviousHTML, setHighlightedPreviousHTML] = useState("");
    const [highlightedCurrentHTML, setHighlightedCurrentHTML] = useState("");
    useEffect(() => {
        if (currentHtml && previousHTML) {
            const diff = Diff.diffWords(previousHTML, currentHtml);
            console.log(diff);
            const previousHTMLHighlighted = diff.map(part => {
                const color = part.removed ? 'red' : 'black';
                if(part.added){
                    return ''
                }
                return `<span style="color: ${color};">${part.value}</span>`;
        
            }).join('');

            const currentHTMLHighlighted = diff.map(part => {
                const color = part.added ? 'green' : 'black';
                if(part.removed){
                    return ''
                }
                return `<span style="color: ${color};">${part.value}</span>`;
            }).join('');

            setHighlightedPreviousHTML(previousHTMLHighlighted);
            setHighlightedCurrentHTML(currentHTMLHighlighted);
        }
    }, [currentHtml, previousHTML])
    return (
        <div className={cls.MainPage}>
            <Header/>
            <div className={cls.content}>
                <DocumentViewer setState={setPreviousHTML} state={highlightedPreviousHTML} type={DocumentType.PREVIOUS} />
                <DocumentViewer setState={setCurrentHtml} state={highlightedCurrentHTML} type={DocumentType.CURRENT} />
            </div>
        </div>
    );
}

