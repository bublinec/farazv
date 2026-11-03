import { Box, Text } from '@chakra-ui/react'
import React from 'react'


const Info:React.FC<{text:string}> = (text) => {
    return (
        <Box>
            <Text
            fontFamily="Ubuntu"
            fontSize="14px"
            fontWeight={300}
            >
                {text}
            </Text>
            <InfoIcon/>
        </Box>
    )
}

export default Info
