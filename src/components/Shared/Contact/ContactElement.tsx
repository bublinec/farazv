import { Grid, Text, Flex } from '@chakra-ui/react'
import React from 'react'

interface ContactElementProps {
    title:string ;
    value:string;
}

export const ContactElement:React.FC<ContactElementProps> = ({title,value}) => {
    return (
        <Flex 
        flexWrap="wrap"
        >
            <Text
            fontFamily="ubuntu"
            fontWeight={300}
            fontStyle="normal"
            fontSize="18.98px"
            overflow="hidden"
            minWidth="25%"
            >{title+":"}</Text>
            

            <Text
            fontFamily="ubuntu"
            fontWeight={500}
            fontStyle="normal"
            fontSize="18.98px"
            color="#012A57"
            overflow="auto"
            >{value}</Text>
        </Flex>
    )
}
export default ContactElement;