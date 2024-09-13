import { Button, ThemeButton } from 'shared/ui/Button/Button';
interface AuthPageProps {
    className?: string
}

export const AuthPage = ({className}: AuthPageProps) => {
    return (
        <div>
            AuthPage
            <Button  theme={ThemeButton.SECONDARY}>Bye Bye</Button>
            <Button  theme={ThemeButton.PRIMARY}>Регистрация</Button>
            <Button  theme={ThemeButton.SECONDARY}>Вход</Button>
        </div>
    );
}

