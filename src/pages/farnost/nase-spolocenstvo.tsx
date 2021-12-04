import {
  Box,
  Container,
  Stack,
  Image,
  Text,
  Center,
  SimpleGrid,
  Icon,
  Flex,
  Grid
} from "@chakra-ui/react";
import { MdPerson, MdEditCalendar, MdLockClock } from "react-icons/md";
import { graphql } from "gatsby";
import React from "react";
import { DynamicZoneRenderer } from "../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../components/Shared/Layout/Layout";
import { FaClock, FaRegCalendarAlt } from "react-icons/fa";
import { BsPerson } from "react-icons/bs";
import { BlogItemColumn } from "../../components/ContentSections/Blog/BlogItemColumn";
import { BlogArchive } from "../../components/ContentSections/Blog/BlogArchive";
import { Lastpeaces } from "../../components/ContentSections/Blog/Lastpiaces";
import { BlogItemRow } from "../../components/ContentSections/Blog/BlogItemRow";

export const query = graphql`
  query useBlogPage {
    STRAPI {
      adminPages(where: { slug: "nase-spolocenstvo" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const BlogPage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];
  const mockData = [
    {
      img: "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png",
      title: "title",
      author: "Janko Mrkva",
      date: "2021-12-19",
      time: "19:30",
      content: "kkjdnfbjkndsfkbjndfkbjncxkvjnkdjfnbkjcnbkjdfnb"
    },
    {
      img: "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png",
      title: "title",
      author: "Janko Mrkva",
      date: "2021-12-19",
      time: "19:30",
      content: "kkjdnfbjkndsfkbjndfkbjncxkvjnkdjfnbkjcnbkjdfnb"
    },
    {
      img: "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png",
      title: "title",
      author: "Janko Mrkva",
      date: "2021-12-19",
      time: "19:30",
      content: "kkjdnfbjkndsfkbjndfkbjncxkvjnkdjfnbkjcnbkjdfnb"
    },
    {
      img: "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png",
      title: "title",
      author: "Janko Mrkva",
      date: "2021-12-19",
      time: "19:30",
      content: "kkjdnfbjkndsfkbjndfkbjncxkvjnkdjfnbkjcnbkjdfnb"
    },
    {
      img: "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png",
      title: "title",
      author: "Janko Mrkva",
      date: "2021-12-19",
      time: "19:30",
      content: "kkjdnfbjkndsfkbjndfkbjncxkvjnkdjfnbkjcnbkjdfnb"
    },
    {
      img: "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png",
      title: "title",
      author: "Janko Mrkva",
      date: "2021-12-19",
      time: "19:30",
      content: "kkjdnfbjkndsfkbjndfkbjncxkvjnkdjfnbkjcnbkjdfnb"
    },
    {
      img: "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png",
      title: "title",
      author: "Janko Mrkva",
      date: "2021-12-19",
      time: "19:30",
      content: "kkjdnfbjkndsfkbjndfkbjncxkvjnkdjfnbkjcnbkjdfnb"
    }
  ];
  console.log();

  return (
    <Layout page={page}>
      <Container maxW={"container.lg"}>
        <Center flexDir="column">
          <BlogItemRow
            img={mockData[0].img}
            title={mockData[0].title}
            author={mockData[0].author}
            date={mockData[0].date}
            time={mockData[0].time}
            content={mockData[0].content}
          />
          <SimpleGrid
            spacing={{ base: 8, md: 10 }}
            py={20}
            columns={{ base: 1, md: 3 }}
          >
            {mockData.map((block) => {
              return (
                <BlogItemColumn
                  img={block.img}
                  title={block.title}
                  author={block.author}
                  date={block.date}
                  time={block.time}
                  content={block.content}
                />
              );
            })}
          </SimpleGrid>
        </Center>
      </Container>
      <Lastpeaces
        items={[
          {
            month: "Januar"
          },
          {
            month: "februar"
          },
          {
            month: "Marec"
          }
        ]}
        description="sdsdsvsv sdvsdvsdvsvsdv sdvsvdsvd"
      />
      <BlogArchive />
    </Layout>
  );
};

export default BlogPage;
