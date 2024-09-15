import classNames from 'classnames';
import * as cls from './DocumentViewer.module.scss';
import React, { FormEvent, forwardRef, RefObject, useEffect, useRef, useState } from 'react';
import axios from 'axios';

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
    const { type, className, currentState, setCurrentState, setPreviousState } = props;
    const [htmlContent, setHtmlContent] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [unEditedHtmlContent, setUnEditedHtmlContent] = useState("");
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [visible, setVisible] = useState(false);
    const containerRef = useRef(null);
    const [selectedHtml, setSelectedHtml] = useState("");
    const [query, setQuery] = useState("");
    const [range, setRange] = useState(null);
    const mods: Record<string, boolean> = {
        [cls[type]]: true
    };
    const saveSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            setRange(selection.getRangeAt(0));
        }

    };
    
    useEffect(() => {
        const fetchDocx = async () => {
            try {
                let response = await fetch("https://ada3e274-df6e-4a1b-baf6-4d7c15a24e2c.selstorage.ru/e6c324f5-0021-425a-b064-e46a6cf5b74e.html");
                let text = await response.text();
                setPreviousState(text);
                response = await fetch("https://ada3e274-df6e-4a1b-baf6-4d7c15a24e2c.selstorage.ru/e6c324f5-0021-425a-b064-e46a6cf5b74e.html");
                text = await response.text();
                setCurrentState(text);
            } catch (e) {
                console.log(e);
            }
        };
        fetchDocx();
    }, []);

    useEffect(() => {
        if (currentState) {
            setHtmlContent(currentState);
        }
    }, [currentState]);

    const inputHandle = (e: React.FormEvent<HTMLDivElement>) => {
        const newHtmlContent = e.currentTarget.innerHTML;
    };

    const saveHandle = (e: FormEvent<HTMLButtonElement>) => {
        setHtmlContent(ref.current.innerHTML);
        setIsEdit(false);
    };

    const cancelEditHandle = (e: FormEvent<HTMLButtonElement>) => {
        setHtmlContent(unEditedHtmlContent);
        setIsEdit(false);
    };

    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !visible && !isEdit) {
            saveSelection();
            const range = selection.getRangeAt(0);
            const clonedSelection = range.cloneContents();
            const div = document.createElement('div');
            div.appendChild(clonedSelection);
            const text = div.innerHTML;
            if (text === '') return;
            setSelectedHtml(text);
            const rect = range.getBoundingClientRect();
            setPosition({
                top: rect.top + window.scrollY + rect.height,
                left: rect.left + window.scrollX,
            });
            setVisible(true);
        } else {
            setVisible(false);
        }
    };
    //@ts-ignore
    const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target) && !isEdit) {
            setVisible(false);
        }
    };

    const sendEdit = async () => {
        const selection = window.getSelection();
        selection.removeAllRanges();
        if (range) {
            selection.addRange(range);
        }        
        if (selection.rangeCount === 0) return; // Убедитесь, что выделение есть

        const newRange = selection.getRangeAt(0);
        const response = await axios.post("http://10.14.144.166:8000/edit", { document_name: "e6c324f5-0021-425a-b064-e46a6cf5b74e.html", span: selectedHtml, query });
        const returnedHtml = response.data.html;

        // Создаем временные div для содержимого
        const tempDiv1 = document.createElement('div');
        tempDiv1.innerHTML = selectedHtml;  // Текущий выделенный HTML

        const tempDiv2 = document.createElement('div');
        tempDiv2.innerHTML = returnedHtml;  // Возвращённый HTML

        // Заменяем выделенный текст на полученный HTML
        newRange.deleteContents();  // Удаляем текущее выделение
        newRange.insertNode(tempDiv2);  // Вставляем новый HTML узел

        // Скрываем инструмент после отправки
        setVisible(false);
        setSelectedHtml("");
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={classNames(cls.DocumentViewer, mods, className)}>
            <div
                ref={ref}
                onMouseUp={handleMouseUp}
                contentEditable={isEdit}
                onInput={inputHandle}
                className={cls.document}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            ></div>
            <div className={cls.instruments}>
                {isEdit ? (
                    <>
                        <button onClick={cancelEditHandle} className={classNames(cls.button, cls.cancel)}>Отменить</button>
                        <button onClick={saveHandle} className={classNames(cls.button, cls.save)}>Сохранить</button>
                    </>
                ) : (
                    <button onClick={() => { setIsEdit(true); setUnEditedHtmlContent(htmlContent) }} className={cls.button}>Редактировать</button>
                )}
            </div>
            {(visible && selectedHtml) && (
                <div
                    ref={containerRef}
                    style={{
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        backgroundColor: 'lightgray',
                        padding: '10px',
                        border: '1px solid #000',
                        zIndex: 1000,
                    }}
                >
                    <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" />
                    <button onClick={sendEdit}>Send</button>
                    <div dangerouslySetInnerHTML={{ __html: selectedHtml }}></div>
                </div>
            )}
        </div>
    );
});
