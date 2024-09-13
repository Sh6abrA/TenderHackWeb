
import classNames from 'classnames';
import * as cls from './Button.module.scss';
import { FC } from 'react';

export enum ThemeButton {
    PRIMARY = 'primary',
    SECONDARY = 'secondary',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string,
    theme?: ThemeButton
}

export const Button: FC<ButtonProps> = (props) => {
    



    const {
        className,
        children,
        theme = ThemeButton.PRIMARY,
        ...otherProps
    } = props

    return (
        <button {...otherProps} className={classNames(cls.Button, className, cls[theme])}>
            {children}
        </button>
    );
}


