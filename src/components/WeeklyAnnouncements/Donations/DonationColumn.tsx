import { Box, BoxProps, Flex, GridItem, Heading, Stack,Text } from "@chakra-ui/react";
import { values } from "lodash";
import React from "react";
import { ReactNode } from "react-markdown";
import { Subheading } from "../../Shared/Subheading/Subheading";

export interface DonationColumnProps extends BoxProps {
  heading:string
  donations:[{
    name:string;
    amount:number|string;
  }]
  children?:ReactNode
}

export const DonationColumn = (props: DonationColumnProps) => {
  const {heading,donations,children, ...restOfProps } = props;
  return(
  <Box {...restOfProps}>
    <Heading color="primary" fontSize="large" fontWeight={500} mb={2}>{heading}</Heading>
    <Stack spacing={0.5}>
      {donations.map((donation)=>{
        return(
          <Flex gridGap={2}>
            <Box>{donation.name}</Box>
            <Box>{donation.amount}</Box>
          </Flex>
        )
      })}
    </Stack>
  </Box>
  )
};
