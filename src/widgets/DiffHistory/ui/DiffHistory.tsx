import { Change, ChangeType } from 'shared/ui/Change/Change';
import * as cls from './DiffHistory.module.scss';
import { useEffect, useMemo } from 'react';

interface DiffHistoryProps {
    className?: string;
    elements: Element[];
    addedClass: string;
    documentViewerRef: React.RefObject<HTMLDivElement>;
    removedClass?: string;
}

export const DiffHistory = ({ className, elements, addedClass, documentViewerRef, removedClass }: DiffHistoryProps) => {    
    const handleClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
 
    return (
        <div className={cls.DiffHistory}>
            <div className={cls.title}>{`Изменения`}</div>
            <div className={cls.container}>
                {elements.map(element => 
                <Change 
                onClick={() => handleClick(element.id)}
                key={element.id} 
                className={className} 
                type={element.classList.contains(addedClass) ? ChangeType.ADDED : ChangeType.DELETED} 
                element={element} />)}
            </div>
        </div>
    );
}

