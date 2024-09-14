import * as cls from './Header.module.scss';
import Logo from 'shared/assets/icons/Logo.png';
interface HeaderProps {
    className?: string
}

export const Header = ({className}: HeaderProps) => {
    return (
        <div className={cls.Header}>
            <img className={cls.Logo} src={Logo} alt="" />
        </div>
    );
}

