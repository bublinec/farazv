import { Box, BoxProps, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { ArrowLink } from "../../Shared/ArrowLink/ArrowLink";
import { IconDate } from "../../Shared/IconDate/IconDate";
import { Subheading } from "../../Shared/Subheading/Subheading";

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
        justifyContent={"space-between"}
      >
        <Box>
          <Subheading fontSize="xl">{title}</Subheading>
          <IconDate dateStr={date} />
          <Text
            marginY={3}
            noOfLines={7}
            fontWeight={400}
            textAlign={"justify"}
          >
            {description}
          </Text>
        </Box>
        {/* <LinkButton to={cta.url}>{cta.text}</LinkButton> */}
        <ArrowLink
          mt={-3}
          href={cta.url}
          alignSelf={"flex-end"}
          color="primary"
          label="Čítať ďalej"
          fontWeight={700}
        />
      </Flex>
    </Box>
  );
};
