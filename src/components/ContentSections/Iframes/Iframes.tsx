import { Box, Stack } from "@chakra-ui/react";
import React from "react";
import { IframesProps } from "../../../lib/features/page/content-sections.d";
import { Container } from "../../Shared/Container/Container";
import { IframeGrid } from "../../Shared/IframeGrid/IframeGrid";
import { LinkButton } from "../../Shared/LinkButton/LinkButton";
import { Text } from "../Text/Text";

export const Iframes = (props: IframesProps) => {
  const { iframes, heading, button, ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Box {...restOfProps}>
        <Container>
          <Stack spacing={{ base: 10, md: 12 }}>
            <Stack>
              {heading && <Text {...heading} />}
              <IframeGrid links={iframes.map((i: any) => i.url)} />
            </Stack>
            {button && (
              <LinkButton
                to={button.link}
                external={button.external}
                alignSelf={"center"}
              >
                {button.text}
              </LinkButton>
            )}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};
