import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IconText } from "../IconText/IconText";

export interface DateProps extends BoxProps {
  dateStr: string;
}

export const IconDate = (props: DateProps) => {
  const { dateStr, ...restOfProps } = props;
  const date = new Date(dateStr);

  const dateFormatted = date.toLocaleString("sk-SK", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <Box {...restOfProps}>
      <IconText icon={<FaRegCalendarAlt />} text={dateFormatted} />
    </Box>
  );
};
