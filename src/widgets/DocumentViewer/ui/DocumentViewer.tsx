import classNames from 'classnames';
import * as cls from './DocumentViewer.module.scss';
import React, { FormEvent, forwardRef, RefObject, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import current from 'shared/assets/pdf/current.docx';
import Send from 'shared/assets/icons/send.svg';
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
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

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

                let response;
                let text;
               
                if (searchParams.get('previousId') === "None") {

                    response = await fetch(searchParams.get('currentId'));
                    text = await response.text();
                    setPreviousState(text);
                } else {
                    response = await fetch(searchParams.get('previousId'));
                    text = await response.text();
                    setPreviousState(text);
                }

                response = await fetch(searchParams.get('currentId'));
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
            const res = await axios.post(`http://pomelk1n-dev.su:8300/new-version?user_id=${searchParams.get('userId')}&document_name=${searchParams.get('documentName')}`, formData)
            if (res.status === 202) navigate('/info');
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
        setIsLoading(true);
        try {
            if (isLoading) return;
            const selection = window.getSelection();
            selection.removeAllRanges();
            if (range) {
                selection.addRange(range);
            }
            if (selection.rangeCount === 0) return; // Убедитесь, что выделение есть
            const currentUrl = searchParams.get('currentId').split('/').pop();
            const newRange = selection.getRangeAt(0);
            const response = await axios.post("http://pomelk1n-dev.su:8100/edit", { document_name: currentUrl, span: selectedHtml, query });
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
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false);

    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    if (!htmlContent) return null;
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
                    <>
                        <button onClick={saveHandle} className={classNames(cls.button, cls.save)}>Отправить</button>
                        <button onClick={() => { setIsEdit(true); setUnEditedHtmlContent(htmlContent) }} className={cls.button}>Редактировать</button>

                    </>
                )}
            </div>
            {(visible && selectedHtml) && (
                <div
                    className={cls.tooltip}
                    ref={containerRef}
                    style={{
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        padding: '10px',
                        zIndex: 1000,
                    }}
                >
                    <div className={cls.sender}>
                        <input placeholder='Введите свой запрос по участку' value={query} onChange={(e) => setQuery(e.target.value)} type="text" />
                        <Send style={{ color: 'var(--secondary-color)', cursor: 'pointer' }} onClick={sendEdit} />

                    </div>
                    <div dangerouslySetInnerHTML={{ __html: selectedHtml }}></div>
                </div>
            )}
        </div>
    );
});
