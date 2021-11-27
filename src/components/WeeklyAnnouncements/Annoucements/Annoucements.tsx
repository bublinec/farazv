import { Box, Center, Container, Flex, Icon, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { CheckIcon} from "@chakra-ui/icons";
import React from "react";
import { MarkdownRenderer } from "../../Shared/MarkdownRenderer/MarkdownRenderer";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";

interface Props {
  body: Array<{ text: string }>;
}

const Annoucements = (props: Props) => {
  const { body, ...restOfProps } = props;
  return (
    <Stack>
        <SimpleGrid column={1} >
        <SectionHeading heading="Oznamy" superscript="Farské oznamy"/>
        {body.map((annoucement) => {
            return (
            <Stack isInline>
                <Center>
                    <Icon as={CheckIcon} width={7} color="primary" pr={2}/>
                    <MarkdownRenderer children={annoucement.text}/>
                </Center>
            </Stack>
            );
        })}
        </SimpleGrid>
    </Stack>
  );
};

export default Annoucements;
