import classNames from 'classnames';
import * as cls from './DocumentViewer.module.scss';
import DocViewer from '@cyntler/react-doc-viewer';
import React, { FormEvent, forwardRef, RefObject, useEffect, useRef, useState } from 'react';

export enum DocumentType {
    PREVIOUS = 'previous',
    CURRENT = 'current',
}

interface DocumentViewerProps {
    type: DocumentType
    className?: string
    currentState?: string
    setCurrentState?: (state: string) => void
    setPreviousState?: (state: string) => void
}

export const DocumentViewer = forwardRef((props: DocumentViewerProps, ref: RefObject<HTMLDivElement>) => {
    const { type, className, currentState, setCurrentState, setPreviousState} = props
    const [htmlContent, setHtmlContent] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [unEditedHtmlContent, setUnEditedHtmlContent] = useState("");
    const mods: Record<string, boolean> = {
        [cls[type]]: true
    }
    useEffect(() => {
        const fetchDocx = async () => {
            try {
                let response = await fetch("https://ada3e274-df6e-4a1b-baf6-4d7c15a24e2c.selstorage.ru/previous.html");
                
                let text = await response.text();
                setPreviousState(text);
                response = await fetch("https://ada3e274-df6e-4a1b-baf6-4d7c15a24e2c.selstorage.ru/current.html");

                text = await response.text();
                setCurrentState(text);

            } catch (e) {
                console.log(e)
            }
        }
        fetchDocx()
    }, [])
    useEffect(() => {
        if (currentState) {
            setHtmlContent(currentState);
        }
    }, [currentState])
    const inputHandle = (e: React.FormEvent<HTMLDivElement>) => {
        const newHtmlContent = e.currentTarget.innerHTML;
    }
    const saveHandle = (e: FormEvent<HTMLButtonElement>) => {
        setHtmlContent(ref.current.innerHTML);
        setIsEdit(false)
    }
    const cancelEditHandle = (e: FormEvent<HTMLButtonElement>) => {
        ref.current.innerHTML = unEditedHtmlContent // Уберите детей от экрана
        setIsEdit(false)
    }

    return (
        <div className={classNames(cls.DocumentViewer, mods, className)}>
            <div ref={ref} contentEditable={isEdit} onInput={inputHandle} className={cls.document} dangerouslySetInnerHTML={{ __html: htmlContent }}></div>
            <div className={cls.instruments}>
                {isEdit ?
                    <>
                        <button onClick={cancelEditHandle} className={classNames(cls.button, cls.cancel)}>Отменить</button>
                        <button onClick={saveHandle} className={classNames(cls.button, cls.save)}>Сохранить</button>
                    </>
                    :
                    <button onClick={() => {setIsEdit(true); setUnEditedHtmlContent(htmlContent)}} className={cls.button}>Редактировать</button>

                }
            </div>
        </div>
    );
})

