import { Box, Img, Stack, Text } from '@chakra-ui/react'
import React from 'react'

interface PriestProps {
    phone?:string| null;
    email?:string| null;
    name:string;
    surname:string;
    photo?:string;
}

const PriestsBox = (props: PriestProps) => {
    return (
        <Box w="200px" h="350px" textAlign="center" border="0.5px solid" borderColor="gray.400" p={0} m={0}>
            <Img 
            w="100%" 
            h="261,84px"
            p={0}
            m={0}
            src={props.photo}
            />
            <Text noOfLines={1} fontSize="xl" fontWeight="bold">{`${props.name} ${props.surname}`}</Text>
            <Stack>
                <Text noOfLines={1} fontSize="small" fontWeight="medium" color="gray.600">
                    {props.phone?.replace(/\s+/g, '')}
                </Text>
                <Text noOfLines={1} fontSize="small" fontWeight="medium" color="gray.600">
                    {props.email}
                </Text>
            </Stack>
        </Box>
    )
}

export default PriestsBox
