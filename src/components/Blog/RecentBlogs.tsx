import { Box, BoxProps, Center, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { useArticles } from "../../lib/features/blog/hooks/useArticles";
import { Container } from "../Shared/Container/Container";
import { SectionHeading } from "../Shared/SectionHeading/SectionHeading";
import { BlogItemColumn } from "./BlogItemColumn";
import { BlogItemRow } from "./BlogItemRow";

export interface RecentBlogsProps extends BoxProps {}

export const RecentBlogs = (props: RecentBlogsProps) => {
  const { ...restOfProps } = props;
  const articles = useArticles();

  return (
    <Box {...restOfProps}>
      <Container>
        <SectionHeading
          heading="Najnovšie články"
          superscript="Naše spoločenstvo"
          mb={{ base: 6 }}
        />
        <Center flexDir="column">
          <BlogItemRow
            display={{ base: "none", md: "flex" }}
            img={articles[0].image}
            title={articles[0].title}
            author={articles[0].author?.name || ""}
            date={articles[0].published_at}
            content={articles[0].description}
            href={`/farnost/nase-spolocenstvo/${articles[0].slug}`}
            mb={14}
          />
          <SimpleGrid
            spacing={{ base: 8, md: 10 }}
            columns={{ base: 1, md: 3 }}
          >
            <BlogItemColumn
              display={{ md: "none" }}
              img={articles[0].image}
              title={articles[0].title}
              author={articles[0].author?.name || ""}
              date={articles[0].published_at}
              content={articles[0].description}
              href={`/farnost/nase-spolocenstvo/${articles[0].slug}`}
            />
            {articles.slice(1).map((article: any) => {
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
        </Center>
      </Container>
    </Box>
  );
};
