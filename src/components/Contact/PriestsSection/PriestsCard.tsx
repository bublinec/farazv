import { Box, Divider, Img, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { ImPhone } from "react-icons/im";
import { LinkItem } from "../../Shared/Footer/components/LinkItem";
import { Superscript } from "../../Shared/Superscript/Superscript";

interface PriestCardProps {
  phone?: string | null;
  email?: string | null;
  title: string;
  role?: string;
  photo?: string;
}

export const PriestCard = (props: PriestCardProps) => {
  const { title, photo, role } = props;

  return (
    <Box
      w="full"
      textAlign="center"
      border="0.5px solid"
      borderColor="borderGray"
    >
      <Img w="100%" h="64" p={0} m={0} src={props.photo} />
      <Box py={4} px={2}>
        {role && <Superscript fontSize={"sm"}>{role}</Superscript>}
        <Text fontSize="xl" fontWeight={400}>
          {title}
        </Text>
        <Stack mt={2} alignItems={"center"}>
          <Divider />
          {props.phone && (
            <LinkItem
              color={"lightGray"}
              label={props.phone}
              to={`/tel:${props.phone}`}
              icon={<ImPhone />}
            />
          )}
        </Stack>
      </Box>
    </Box>
  );
};
