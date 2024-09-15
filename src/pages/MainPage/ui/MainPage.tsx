import { Header } from 'widgets/Header';
import * as cls from './MainPage.module.scss';
import { DocumentType, DocumentViewer } from 'widgets/DocumentViewer';
import { createRef, useEffect, useRef, useState } from 'react';
import * as Diff from 'diff';
import { DiffHistory } from 'widgets/DiffHistory';
import DOMPurify from 'dompurify';
import { DiffDOM } from 'diff-dom';
import { visualDomDiff } from 'visual-dom-diff'
interface MainPageProps {
    className?: string
}

export const MainPage = ({ className }: MainPageProps) => {
    const [currentHtml, setCurrentHtml] = useState("");
    const [previousHTML, setPreviousHTML] = useState("");
    const [highlightedHTML, setHighlightedHTML] = useState("");
    const [elements, setElements] = useState([]);
    const documentViewerRef = useRef<HTMLDivElement>();
    useEffect(() => {

        if (currentHtml && previousHTML) {
            // const diff = Diff.diffWords(previousHTML, currentHtml);
            // console.log(diff);
            // const HTMLHighlighted = diff.map(part => {
            //     const color = part.removed ? 'red' : part.added ? 'green' : 'black';

            //     if(color != 'black'){
            //         console.log(part.value);
            //     } else {
            //         return part.value
            //     }
            //     const test = document.createElement('div');
            //     test.innerHTML = part.value;
            //     const text = test.textContent;
            //     return `<span style="color: ${color};">${text}</span>`;

            // }).join('');

            // setHighlightedHTML(DOMPurify.sanitize(HTMLHighlighted));

            const currentDom = new DOMParser().parseFromString(currentHtml, 'text/html');
            const previousDom = new DOMParser().parseFromString(previousHTML, 'text/html');

            const skipSelf = (node: Node): boolean => {
                if (node.nodeName === 'TABLE' || node.textContent === '&nbsp;' || node.textContent === '') {
                    const tableElement = node as HTMLTableElement;
                }
                return node.nodeName === 'TABLE' || node.textContent.length === 0; // Пропускаем узлы, которые являются <table>
            };
            const diffNode = visualDomDiff(currentDom, previousDom, { skipModified: true, addedClass: cls.vdd_added, removedClass: cls.vdd_removed, skipSelf });

            let newHtml = diffNode.children[0].innerHTML;
            const div = document.createElement('div')
            div.innerHTML = newHtml

            newHtml = newHtml.replace("<tbody>", "<table><tbody>");
            newHtml = newHtml.replace("</tbody>", "</tbody></table>");
            const inserts = div.querySelectorAll(`.${cls.vdd_added}`)
            const deletions = div.querySelectorAll(`.${cls.vdd_removed}`)
            inserts.forEach(insert => {
                const regex = /[^\s]/;
                // @ts-ignore
                if (!regex.test(insert.innerText) || insert.tagName == 'STYLE') insert.remove()
            })

            deletions.forEach(deletion => {
                const regex = /[^\s]/;
                // @ts-ignore
                if (!regex.test(deletion.innerText) || deletions.tagName == 'STYLE') deletion.remove()
            })
            let index = 0;
            const traverseChildren = (element: Element) => {
                // Проходим по всем дочерним элементам
                for (let i = 0; i < element.children.length; i++) {
                    const child = element.children[i];

                    // Проверяем наличие классов
                    if (child.classList.contains(cls.vdd_added) || child.classList.contains(cls.vdd_removed)) {
                        child.id = `changeItemId${index}`;
                        if (child.classList.contains(cls.vdd_removed)) {

                            child.setAttribute('contenteditable', 'false')
                        }
                        index++

                    }

                    traverseChildren(child);
                }
            }

            traverseChildren(div);
            newHtml = div.innerHTML
            setHighlightedHTML(newHtml);
            const doc = new DOMParser().parseFromString(newHtml, 'text/html');
            const itemsArray = Array.from(doc.querySelectorAll(`.${cls.vdd_added}, .${cls.vdd_removed}`))
            setElements(itemsArray)
        }
    }, [currentHtml, previousHTML])
    return (
        <div className={cls.MainPage}>
            <Header />
            <div className={cls.content}>
                <DocumentViewer  addedClass={cls.vdd_added} removedClass={cls.vdd_removed} ref={documentViewerRef} setCurrentState={setPreviousHTML} setPreviousState={setCurrentHtml} currentState={highlightedHTML} type={DocumentType.PREVIOUS} />
                <DiffHistory documentViewerRef={documentViewerRef} addedClass={cls.vdd_added} elements={elements} />
            </div>
        </div>
    );
}

