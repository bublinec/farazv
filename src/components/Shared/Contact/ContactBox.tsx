import { Box, Flex, Text } from '@chakra-ui/react'
import * as React from 'react'
// import Info from './Info';
interface ContactProps{
    heading:string;
    info?:string;
    children?:React.ReactChild[] ;

}

export const ContactBox:React.FC<ContactProps> =(props) => {
    return (
        <>
            <Flex
            flexDir="column"
            paddingBottom="27px"
            >
                <Flex>
                    <Text                 
                    fontFamily="ubuntu"
                    fontSize="29.83px" 
                    >{props.heading}
                    </Text>
                </Flex>
                {props.children}
                
            </Flex>
        </>
    )
}
export default ContactBox;