import { Box, Divider, Stack, Text } from "@chakra-ui/react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import React from "react";
import { ImPhone } from "react-icons/im";
import { LinkItem } from "../../Shared/Footer/components/LinkItem";
import { Superscript } from "../../Shared/Superscript/Superscript";

interface PriestCardProps {
  phone?: string | null;
  email?: string | null;
  title: string;
  role?: string;
  photo?: any;
}

export const PriestCard = (props: PriestCardProps) => {
  const { title, photo, role } = props;
  const extractedImage = getImage(photo.localFile);

  return (
    <Box
      w="full"
      textAlign="center"
      border="0.5px solid"
      borderColor="borderGray"
    >
      {extractedImage && (
        <GatsbyImage image={extractedImage} alt="priest photo" />
      )}
      <Box py={4} px={2}>
        {role && (
          <Superscript fontSize={{ base: "xs", md: "sm" }}>{role}</Superscript>
        )}
        <Text fontSize={{ base: "md", md: "xl" }} fontWeight={400}>
          {title}
        </Text>
        <Stack mt={2} alignItems={"center"}>
          <Divider />
          {props.phone && (
            <LinkItem
              hoverColor="primary"
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
