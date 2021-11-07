import { Box, BoxProps, Flex } from "@chakra-ui/react";
import React from "react";
import { IconDate } from "../../Shared/IconDate/IconDate";
import { LinkButton } from "../../Shared/LinkButton/LinkButton";
import { MarkdownRenderer } from "../../Shared/MarkdownRenderer/MarkdownRenderer";
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
      <Flex
        flexDir="column"
        gridGap={{ base: 2, md: 2 }}
        h={{ base: "auto", md: 274 }}
        justifyContent={"space-between"}
      >
        <Box>
          <Subheading>{title}</Subheading>
          <IconDate dateStr={date} />
          <MarkdownRenderer
            h={{ base: "auto", md: 122 }}
            overflowY={"hidden"}
            mt={2}
          >
            {description}
          </MarkdownRenderer>
        </Box>
        <LinkButton to={cta.url}>{cta.text}</LinkButton>
      </Flex>
    </Box>
  );
};
