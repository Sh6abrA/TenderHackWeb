import classNames from 'classnames';
import * as cls from './DocumentViewer.module.scss';
import React, { FormEvent, forwardRef, RefObject, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import current from 'shared/assets/pdf/current.docx';

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
    addedClass: string
    removedClass: string
    elements?: Element[]
}

export const DocumentViewer = forwardRef((props: DocumentViewerProps, ref: RefObject<HTMLDivElement>) => {
    const { type, className, currentState, setCurrentState, setPreviousState, addedClass, removedClass, elements } = props;
    const [htmlContent, setHtmlContent] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [unEditedHtmlContent, setUnEditedHtmlContent] = useState("");
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [visible, setVisible] = useState(false);
    const containerRef = useRef(null);
    const [selectedHtml, setSelectedHtml] = useState("");
    const [query, setQuery] = useState("");
    const [range, setRange] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    
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
                setSearchParams({ 
                    currentId: '9e0337d7-60cf-4f2f-adf5-30088f2517dc', 
                    previousId: '2fa1d236-27f5-47c7-be3e-be199f702b01',
                    documentName: 'current.docx',
                    userId: '12345'  });

                let response = await fetch("https://ada3e274-df6e-4a1b-baf6-4d7c15a24e2c.selstorage.ru/2fa1d236-27f5-47c7-be3e-be199f702b01.html");
                let text = await response.text();
                setPreviousState(text);
                response = await fetch("https://ada3e274-df6e-4a1b-baf6-4d7c15a24e2c.selstorage.ru/9e0337d7-60cf-4f2f-adf5-30088f2517dc.html");
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

    const saveHandle = async (e: FormEvent<HTMLButtonElement>) => {
        try {
            setIsEdit(false);
            let send = ref.current;

            // Удаляем класс и id у элементов с классом addedClass
            const inserts = send.querySelectorAll(`.${addedClass}`);
            inserts.forEach((element) => {
                element.removeAttribute('class');
                element.removeAttribute('id');
            });

            // Удаляем элементы с классом removedClass
            const removes = send.querySelectorAll(`.${removedClass}`);
            removes.forEach((element) => {
                element.remove();
            });
            console.log(send.innerHTML)
            const formData = new FormData();
            formData.append('version_file', send.innerHTML);
            await axios.post(`http://192.168.48.68:65386/new-version?user_id=${12345}&document_name=${"24000014.docx"}`, formData)
            setHtmlContent(ref.current.innerHTML);
        }
        catch (e) { console.log(e) }

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

            // Вырезаем выделенный текст
            range.deleteContents();

            // Вставляем текст обратно
            const fragment = document.createRange().createContextualFragment(text);
            range.insertNode(fragment);

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
        console.log(tempDiv1.textContent, tempDiv2.textContent);

        const newHtmlContent = htmlContent.replace(tempDiv1.innerHTML, returnedHtml);
        range.deleteContents();

        setPreviousState(htmlContent);
        // Вставляем текст обратно
        const fragment = document.createRange().createContextualFragment(returnedHtml);
        range.insertNode(fragment);
        setCurrentState(ref.current.innerHTML);


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
                onChange={inputHandle}
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
