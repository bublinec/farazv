import { Grid, Text, Flex, useMediaQuery } from '@chakra-ui/react'
import React from 'react'

interface ContactElementProps {
    title:string ;
    value:string;
}

export const ContactElement:React.FC<ContactElementProps> = ({title,value}) => {
    const[isMobile, setIsmobile]=useMediaQuery([
        "(max-width: 893px)"
      ])
    return (
        <Flex 
        flexWrap="wrap"
        display="flex"
        >
            <Text
            fontFamily="ubuntu"
            fontWeight={300}
            fontStyle="normal"
            fontSize={isMobile?"16px":"18px"}
            overflow="hidden" 
            >{title+" :"}</Text>
            
            <Text
            fontFamily="ubuntu"
            fontWeight={500}
            fontStyle="normal"
            fontSize={isMobile?"16px":"18px"}
            color="#012A57"
            >{" "+value}</Text>
        </Flex>
    )
}
export default ContactElement;