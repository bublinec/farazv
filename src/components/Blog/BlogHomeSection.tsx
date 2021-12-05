import { Box, BoxProps, SimpleGrid, Stack } from "@chakra-ui/react";
import BackgroundImage from "gatsby-background-image";
import { getImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import React from "react";
import { useArticles } from "../../lib/features/blog/hooks/useArticles";
import { TextProps } from "../../lib/features/page/content-sections.d";
import { Text } from "../ContentSections/Text/Text";
import { Container } from "../Shared/Container/Container";
import { LinkButton } from "../Shared/LinkButton/LinkButton";
import { Overlay } from "../Shared/Overlay/Overlay";
import { BlogItemColumn } from "./BlogItemColumn";
import { useBlogBgImage } from "./hooks/useBlogBgImage";

export interface BlogHomeSectionProps extends BoxProps {
  heading: TextProps;
  excludedBlogSlug?: string;
}
export const BOTTOM_MARGIN = 64;

export const BlogHomeSection = (props: BlogHomeSectionProps) => {
  const { heading, excludedBlogSlug, ...restOfProps } = props;
  let articles = useArticles();
  const image = useBlogBgImage();
  const extractedImage = getImage(image.fileName);
  const bgImage = convertToBgImage(extractedImage);
  if (excludedBlogSlug) {
    articles = articles.filter((a: any) => a.slug != excludedBlogSlug);
  }

  return (
    <Box {...restOfProps} py={4} pb={BOTTOM_MARGIN - 20}>
      {bgImage && (
        <BackgroundImage {...bgImage} preserveStackingContext>
          <Overlay zIndex={0} opacity={90} />
          <Container py={14} position="relative">
            <Text
              {...heading}
              alignItems="center"
              mb={12}
              light
              maxW={560}
              mx={"auto"}
            />

            <Stack mb={-BOTTOM_MARGIN} alignItems="center" spacing={12}>
              <SimpleGrid
                spacing={{ base: 8, md: 12 }}
                columns={{ base: 1, md: 3 }}
              >
                {articles.slice(0, 3).map((article: any) => {
                  return (
                    <BlogItemColumn
                      img={article.image}
                      title={article.title}
                      author={article.author?.name || ""}
                      date={article.published_at}
                      content={article.description}
                      href={`/farnost/nase-spolocenstvo/${article.slug}`}
                    />
                  );
                })}
              </SimpleGrid>
              <LinkButton to={"/farnost/nase-spolocenstvo"}>
                Zobraziť viac článkov
              </LinkButton>
            </Stack>
          </Container>
        </BackgroundImage>
      )}
    </Box>
  );
};
