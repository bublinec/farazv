import { Box } from '@chakra-ui/react';
import React from 'react';
import { Container } from '../../Container/Container';

export interface FooterBottomProps {
    className?: string;
}

export const FooterBottom = (props: FooterBottomProps) => {
    const { className = '' } = props;
    const year = new Date().getFullYear();
    return (
        <Box bg='black' className={`${className} py-6 text-white text-sm lg:text-base font-thin`}>
            <Container className='text-center'>
                <span className='opacity-100'>Stránka vytvorená spoločnosťou </span>
                <a
                    target='_blank'
                    rel='noopener noreferrer'
                    className='opacity-70 text-secondary hover:opacity-100 transition-all duration-300 ease-in-out'
                    href='https://mmntm.digital'
                >
                    {' '}
                    Momentum Digital
                </a>{' '}
                <span className='opacity-100'>© {year}</span>
            </Container>
        </Box>
    );
};
