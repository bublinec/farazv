import { Box, Flex, GridItem, SimpleGrid, Spacer,Text } from '@chakra-ui/react'
import React from 'react'

export interface Props {
    day:string;
    date:Date;
}

const MassScheduleItem = (props: Props) => {
    const {day,date, ...restOfProps } = props;
    return (
        <SimpleGrid columns={1} w="350px">
            <GridItem>
                <Flex>
                    <Box fontSize="xx-large" fontWeight={500}>{day}</Box>
                    <Spacer/>
                    <Text fontSize="xl" fontWeight={400} p={4} color="primary">{date.toLocaleDateString()}</Text>
                </Flex>
            </GridItem>
        </SimpleGrid>
    )
}

export default MassScheduleItem
