import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import React from 'react';

export interface ButtonProps extends ChakraButtonProps {}

export const Button = (props: ButtonProps) => {
    return (
        <ChakraButton
            // rounded='sm'
            // py={6}
            // px={8}
            // _focus={{
            //     outline: 'none',
            // }}
            // _hover={{
            //     bg: 'darkGray',
            // }}
            // _active={{
            //     bg: 'darkGray',
            // }}
            // color='white'
            // bg='darkGray'
            {...props}
        />
    );
};
