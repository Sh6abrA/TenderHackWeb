import classNames from 'classnames';
import * as cls from './Change.module.scss';
import { useState } from 'react';
export enum ChangeType {
    ADDED = 'added',
    DELETED = 'deleted'
}
interface ChangeProps {
    className?: string
    type: ChangeType
    element: Element
    onClick?: () => void
}

export const Change = ({ className, type, element, onClick }: ChangeProps) => {
    const [deleted, setDeleted] = useState(false)
    console.log(element)
    if (element.innerHTML == '') return null
    const handleCancelClick = () => {
        if (type == ChangeType.ADDED) {
            const el = document.getElementById(element.id)
            el.remove()
        } else {
            const el = document.getElementById(element.id)
            let div = document.createElement('span')
            if (el.tagName == 'P') {
                // div = document.createElement('p')
                // div.className = 'MsoNormal'
                // div.setAttribute("style", "margin-left:35.45pt;text-align:justify;border:none")
                el.removeAttribute('class')
                el.removeAttribute('id')
                el.removeAttribute('contenteditable')
            } else if(el.tagName == 'STYLE') {
                el.remove()
            }
            else {
                div.innerHTML = element.innerHTML
                el.parentNode.replaceChild(div, el)

            }
        }
        setDeleted(true)
    }
    if (deleted) return null
    return (
        <div onClick={onClick} className={classNames(cls.Change, className, cls[type])}>
            <div className={cls.info}>
                <div className={cls.type}>{type === ChangeType.ADDED ? 'Добавлено' : 'Удалено'}</div>
                <div onClick={handleCancelClick} className={cls.cancel}>&#10005;</div>
            </div>
            <div className={cls.text}>{element.textContent}</div>
        </div>
    );
}

