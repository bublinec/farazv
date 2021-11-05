import { routes } from '@/lib/routes';
import { Link } from 'gatsby';
import React from 'react';
import { Logo } from './Logo';

export interface LogoLinkProps extends React.HTMLAttributes<HTMLElement> {
    light?: boolean;
}

export const LogoLink: React.FC<LogoLinkProps> = (props: LogoLinkProps) => {
    const { light = false } = props;

    return (
        <Link to={routes.home.to} className={props.className + ' flex items-center'}>
            <Logo />
            {/* <img src={light ? LogoWhite : Logo} alt="logo" className="w-36" /> */}
        </Link>
    );
};
