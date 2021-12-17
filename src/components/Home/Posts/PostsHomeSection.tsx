import { Box, BoxProps, SimpleGrid, Stack } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import { getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import React from "react";
import { TextProps } from "../../../lib/features/page/content-sections.d";
import { usePosts } from "../../../lib/features/posts/hooks/usePosts";
import { Text } from "../../ContentSections/Text/Text";
import { Container } from "../../Shared/Container/Container";
import { Overlay } from "../../Shared/Overlay/Overlay";
import { usePostsBgImage } from "./hooks/usPostsBgImage";
import { PostItemColumn } from "./PostItemColumn";

export interface PostsHomeSectionProps extends BoxProps {
  heading: TextProps;
  excludedPostSlug?: string;
}
export const BOTTOM_MARGIN = 64;

export const PostsHomeSection = (props: PostsHomeSectionProps) => {
  const { heading, excludedPostSlug, ...restOfProps } = props;
  let posts = usePosts();
  const image = usePostsBgImage();
  const extractedImage = getImage(image.fileName);
  const bgImage = convertToBgImage(extractedImage);
  if (excludedPostSlug) {
    posts = posts.filter((a: any) => a.slug != excludedPostSlug);
  }

  return (
    <Box {...restOfProps} py={4} pb={BOTTOM_MARGIN - 20}>
      {bgImage && (
        <BackgroundImage {...bgImage} preserveStackingContext>
          <Overlay zIndex={0} opacity={80} />
          <Container py={14} position="relative">
            <Text
              {...heading}
              alignItems="center"
              mb={{ base: 8, md: 10 }}
              light
              maxW={560}
              mx={"auto"}
            />

            <Stack mb={-BOTTOM_MARGIN} alignItems="center" spacing={12}>
              <SimpleGrid
                spacing={{ base: 8, md: 12 }}
                columns={{ base: 1, md: 3 }}
              >
                {posts.slice(0, 3).map((post: any) => {
                  return (
                    <PostItemColumn
                      img={post.image}
                      title={post.title}
                      date={post.published_at}
                      content={post.description}
                      href={`/prispevky/${post.slug}`}
                    />
                  );
                })}
              </SimpleGrid>
              {/* <LinkButton to={"/farnost/nase-spolocenstvo"}>
                Zobraziť viac článkov
              </LinkButton> */}
            </Stack>
          </Container>
        </BackgroundImage>
      )}
    </Box>
  );
};
