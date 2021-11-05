import React from 'react';
import { Container } from '../Container/Container';
import { LogoLink } from '../LogoLink/LogoLink';
import { MobileMenu } from './components/MobileMenu';
import { Navbar } from './Navbar/Navbar';

export interface HeaderProps {
    className?: string;
}

export const Header = (props: HeaderProps) => {
    const { className = '' } = props;

    return (
        <header className={`${className}`}>
            <Navbar />
        </header>
    );
};
