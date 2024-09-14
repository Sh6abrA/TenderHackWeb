import classNames from 'classnames';
import * as cls from './DocumentViewer.module.scss';
import DocViewer from '@cyntler/react-doc-viewer';
import { forwardRef, RefObject, useEffect, useRef, useState } from 'react';
import mammoth from 'mammoth';
import previous from 'shared/assets/pdf/previous.docx';
import current from 'shared/assets/pdf/current.docx';
export enum DocumentType {
    PREVIOUS = 'previous',
    CURRENT = 'current',
}

interface DocumentViewerProps {
    type: DocumentType
    className?: string
    state?: string
    setState?: (state: string) => void
}

export const DocumentViewer = forwardRef((props: DocumentViewerProps, ref: RefObject<HTMLDivElement>) => {
    const {type, className, state, setState} = props
    const [htmlContent, setHtmlContent] = useState("");
    const mods: Record<string, boolean> = {
        [cls[type]]: true
    }
    useEffect(() => {
        const fetchDocx = async () => {
            try {
                const response = await fetch(type === DocumentType.PREVIOUS ? previous : current);
                const arrayBuffer = await response.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setHtmlContent(result.value); 
                setState(result.value);
                console.log(123);
            } catch (e) {

            }
        }
        fetchDocx()
    }, [])
    useEffect(() => {
        if(state){
            setHtmlContent(state);
        }
    }, [state])

    return (
        <div className={classNames(cls.DocumentViewer, mods, className)}>
            <div ref={ref} className={cls.document} dangerouslySetInnerHTML={{__html: htmlContent}}></div>
        </div>
    );
})

