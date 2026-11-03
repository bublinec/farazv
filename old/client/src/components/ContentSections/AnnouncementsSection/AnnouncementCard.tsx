import { Box, BoxProps, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { ArrowButtonLink } from "../../Shared/ArrowButtonLink/ArrowButtonLink";
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
            noOfLines={6}
            fontWeight={400}
            textAlign={"justify"}
          >
            {description}
          </Text>
        </Box>
        <Box alignSelf={"flex-end"}>
          {/* <LinkButton to={cta.url}>{cta.text}</LinkButton> */}

          <ArrowButtonLink
            href={cta.url}
            buttonProps={{
              mt: -3,
              color: "primary",
              label: "Čítať ďalej",
              fontWeight: 700
            }}
          />
        </Box>
      </Flex>
    </Box>
  );
};
