import { Box, BoxProps, Center, SimpleGrid } from "@chakra-ui/react";
import React, { useState } from "react";
import { useArticles } from "../../lib/features/blog/hooks/useArticles";
import { Button } from "../Shared/Button/Button";
import { Container } from "../Shared/Container/Container";
import { SectionHeading } from "../Shared/SectionHeading/SectionHeading";
import { BlogItemColumn } from "./BlogItemColumn";
import { BlogItemRow } from "./BlogItemRow";

export interface RecentBlogsProps extends BoxProps {}

const INITIAL_UPPER_LIMIT = 10;
const STEP = 6;

export const RecentBlogs = (props: RecentBlogsProps) => {
  const { ...restOfProps } = props;
  const articles = useArticles();
  const [upperLimit, setUpperLimit] = useState(INITIAL_UPPER_LIMIT);

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
            {articles.slice(1, upperLimit).map((article: any) => {
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
          {articles.length >= upperLimit && (
            <Button
              mt={{ base: 10, md: 14 }}
              onClick={() => setUpperLimit(upperLimit + STEP)}
            >
              Zobraziť viac
            </Button>
          )}
        </Center>
      </Container>
    </Box>
  );
};
