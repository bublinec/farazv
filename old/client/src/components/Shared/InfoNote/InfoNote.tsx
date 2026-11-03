import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import { IconText } from "../IconText/IconText";

export interface InfoNoteProps extends BoxProps {
  text: string;
}

export const InfoNote = (props: InfoNoteProps) => {
  const { text, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <IconText
        text={text}
        icon={
          <Box color="primary">
            <FaInfoCircle />
          </Box>
        }
      />
    </Box>
  );
};
