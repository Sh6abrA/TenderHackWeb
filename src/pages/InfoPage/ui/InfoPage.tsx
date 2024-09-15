import * as cls from './InfoPage.module.scss';
import Success from 'shared/assets/icons/Success.svg';
interface InfoPageProps {
    className?: string
}

export const InfoPage = ({className}: InfoPageProps) => {
    return (
        <div className={cls.InfoPage}>
            <Success/>
            <div className={cls.text}>Документ сохранён</div>
        </div>
    );
}

