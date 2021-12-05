import { Box, BoxProps, Flex } from "@chakra-ui/react";
import React from "react";
import { IconDate } from "../../Shared/IconDate/IconDate";
import { LinkButton } from "../../Shared/LinkButton/LinkButton";
import { Subheading } from "../../Shared/Subheading/Subheading";
import { Text } from "../Text/Text";

export interface AnnouncementCardProps extends BoxProps {
  title: string;
  date: string;
  description: string;
  cta: {
    url: string;
    text: string;
  };
}

export const AnnouncementCard = (props: AnnouncementCardProps) => {
  const { title, date, description, cta, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Flex
        flexDir="column"
        gridGap={{ base: 2, md: 2 }}
        h={{ base: "auto", md: 274 }}
        justifyContent={"space-between"}
      >
        <Box>
          <Subheading fontSize="xl">{title}</Subheading>
          <IconDate dateStr={date} />
          <Text marginY={3} noOfLines={5} fontWeight={400}>
            {description}
          </Text>
        </Box>
        <LinkButton to={cta.url}>{cta.text}</LinkButton>
      </Flex>
    </Box>
  );
};
