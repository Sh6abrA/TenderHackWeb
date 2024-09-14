import classNames from 'classnames';
import * as cls from './Change.module.scss';
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

export const Change = ({ className, type , element, onClick}: ChangeProps) => {
    console.log(element)
    if(element.innerHTML == '') return null
    return (
        <div onClick={onClick} className={classNames(cls.Change, className, cls[type])}>
            <div className={cls.type}>{type === ChangeType.ADDED ? 'Добавлено' : 'Удалено'}</div>
            <div className={cls.text}>{element.textContent}</div>
        </div>
    );
}

