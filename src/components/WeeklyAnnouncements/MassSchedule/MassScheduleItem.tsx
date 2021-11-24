import { Box, Flex, GridItem, SimpleGrid, Spacer,Stack,Text } from '@chakra-ui/react'
import React from 'react'
import { IconDate } from '../../Shared/IconDate/IconDate';
import { IconText } from '../../Shared/IconText/IconText';
import {BiBookBookmark} from 'react-icons/all'
import { MassScheduleItemRow, MassScheduleItemRowProps } from './MassSheduleItemRow';

export interface Props {
    day:string;
    date:string;
    group:string;
    items: {
        time: string;
        name: string;
        value:string
    }[]
}

const MassScheduleItem = (props: Props) => {
    const {day,date,group,items, ...restOfProps } = props;
    return (
        <Box border="1px" borderColor="gray.200" maxWidth="350px">
            <SimpleGrid columns={1} spacing={2}>
                <GridItem>
                    <Flex>
                        <Box fontSize="xx-large" fontWeight={500} pl={2}>{day}</Box>
                        <Spacer/>
                        <IconDate p={2} dateStr={date}/>
                    </Flex>
                </GridItem>
                <GridItem>
                    <IconText pl={2} icon={<BiBookBookmark/>} text={group}></IconText>
                </GridItem>
                <GridItem>
                    <Stack spacing={1}>
                        {items.map((row)=>{
                            return <MassScheduleItemRow time={row.time} name={row.name} value={row.value} />
                        })}
                    </Stack>
                </GridItem>
            </SimpleGrid>
        </Box>
    )
}

export default MassScheduleItem
