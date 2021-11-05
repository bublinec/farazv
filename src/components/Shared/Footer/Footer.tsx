import { Box } from '@chakra-ui/react';
import React from 'react';
import { FooterBottom } from './components/FooterBottom';
import { FooterTop } from './components/FooterTop';

export interface FooterProps {
    className?: string;
}

export const Footer = (props: FooterProps) => {
    return (
        <Box as='footer' bg='black' className={props.className}>
            <FooterTop />
            <FooterBottom />
        </Box>
    );
};
