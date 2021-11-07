import { Box, BoxProps, Stack } from "@chakra-ui/react";
import React from "react";
import { SectionHeadingSmall } from "../../SectionHeadingSmall/SectionHeadingSmall";
import { LinkItem, LinkItemProps } from "./LinkItem";

export interface FooterColumnProps extends BoxProps {
  title: string;
  items: LinkItemProps[];
}

export const FooterColumn = (props: FooterColumnProps) => {
  const { title, items, ...restOfProps } = props;

  return (
    <Box {...restOfProps}>
      <SectionHeadingSmall heading={title} color="white" />
      <Stack spacing={0}>
        {items.map((i) => (
          <LinkItem label={i.label} to={i.to} icon={i.icon} />
        ))}
      </Stack>
    </Box>
  );
};
