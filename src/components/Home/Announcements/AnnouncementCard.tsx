import { Box, BoxProps, Flex } from "@chakra-ui/react";
import React from "react";
import { LinkButton } from "../../Shared/LinkButton/LinkButton";
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

// @IMRE: CTA MEANS 'CALL TO ACTION' WHICH IS A BUTTON THAT SUGGEST YOU TO DO SOMETHING

export const AnnouncementCard = (props: AnnouncementCardProps) => {
  const { title, date, description, cta, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Flex flexDir="column" gridGap={2}>
        {/* TODO: ADD ICON TEXT - DATE */}
        <Subheading>{title}</Subheading>
        {description}
        <LinkButton to={cta.url}>{cta.text}</LinkButton>
      </Flex>
    </Box>
  );
};
