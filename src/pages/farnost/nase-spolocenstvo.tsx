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

  return (
    <Layout page={page}>
      <Container maxW={"container.lg"} marginTop={3}>
        <BlogItemRow
          img={
            "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png"
          }
          title={"sdbdbvds"}
          author={"sdvdv sdvdv"}
          date={"svvvwevw"}
          time={"sdvdvvvv"}
          content={
            "jhdcjhvckhvhcvckhdsvckhsagcvakhcgvscjhvcjsvcjscvjhcvsjcvsjhvjhdvsjhvcjxhcsjvhcbjhvbdsjhvbwjhbvdjsdhcbvjhwvbjhcdhj cjhvcjhvc jadshvjhvcjhqc jhvjhc jac hsvxjhvs jh vdjhvsjv hxjhvcasjd hasjhxzvjhsd cjs hvxjhcvjhcvsjhxvjhcvjhcvsjhxcvsjhvcjcvschjvsjhvsjhvcshjcvjhvsjchvcksdvckjhvgjcvskj bksjd vjh vjvjh v jhvjh"
          }
        />
        <SimpleGrid
          spacing={{ base: 8, md: 10 }}
          marginLeft={{ base: "auto" }}
          py={20}
          columns={{ base: 1, md: 3 }}
        >
          <BlogItemColumn
            img={
              "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png"
            }
            title={"sdbdbvds"}
            author={"sdvdv sdvdv"}
            date={"svvvwevw"}
            time={"sdvdvvvv"}
            content={
              "jhdcjhvckhvhcvckhdsvckhsagcvakhcgvscjhvcjsvcjscvjhcvsjcvsjhvjhdvsjhvcjxhcsjvhcbjhvbdsjhvbwjhbvdjsdhcbvjhwvbjhcdhj cjhvcjhvc jadshvjhvcjhqc jhvjhc jac hsvxjhvs jh vdjhvsjv hxjhvcasjd hasjhxzvjhsd cjs hvxjhcvjhcvsjhxvjhcvjhcvsjhxcvsjhvcjcvschjvsjhvsjhvcshjcvjhvsjchvcksdvckjhvgjcvskj bksjd vjh vjvjh v jhvjh"
            }
          />
          <BlogItemColumn
            img={
              "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png"
            }
            title={"sdbdbvds"}
            author={"sdvdv sdvdv"}
            date={"svvvwevw"}
            time={"sdvdvvvv"}
            content={
              "jhdcjhvckhvhcvckhdsvckhsagcvakhcgvscjhvcjsvcjscvjhcvsjcvsjhvjhdvsjhvcjxhcsjvhcbjhvbdsjhvbwjhbvdjsdhcbvjhwvbjhcdhj cjhvcjhvc jadshvjhvcjhqc jhvjhc jac hsvxjhvs jh vdjhvsjv hxjhvcasjd hasjhxzvjhsd cjs hvxjhcvjhcvsjhxvjhcvjhcvsjhxcvsjhvcjcvschjvsjhvsjhvcshjcvjhvsjchvcksdvckjhvgjcvskj bksjd vjh vjvjh v jhvjh"
            }
          />
          <BlogItemColumn
            img={
              "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png"
            }
            title={"sdbdbvds"}
            author={"sdvdv sdvdv"}
            date={"svvvwevw"}
            time={"sdvdvvvv"}
            content={
              "jhdcjhvckhvhcvckhdsvckhsagcvakhcgvscjhvcjsvcjscvjhcvsjcvsjhvjhdvsjhvcjxhcsjvhcbjhvbdsjhvbwjhbvdjsdhcbvjhwvbjhcdhj cjhvcjhvc jadshvjhvcjhqc jhvjhc jac hsvxjhvs jh vdjhvsjv hxjhvcasjd hasjhxzvjhsd cjs hvxjhcvjhcvsjhxvjhcvjhcvsjhxcvsjhvcjcvschjvsjhvsjhvcshjcvjhvsjchvcksdvckjhvgjcvskj bksjd vjh vjvjh v jhvjh"
            }
          />
          <BlogItemColumn
            img={
              "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png"
            }
            title={"sdbdbvds"}
            author={"sdvdv sdvdv"}
            date={"svvvwevw"}
            time={"sdvdvvvv"}
            content={
              "jhdcjhvckhvhcvckhdsvckhsagcvakhcgvscjhvcjsvcjscvjhcvsjcvsjhvjhdvsjhvcjxhcsjvhcbjhvbdsjhvbwjhbvdjsdhcbvjhwvbjhcdhj cjhvcjhvc jadshvjhvcjhqc jhvjhc jac hsvxjhvs jh vdjhvsjv hxjhvcasjd hasjhxzvjhsd cjs hvxjhcvjhcvsjhxvjhcvjhcvsjhxcvsjhvcjcvschjvsjhvsjhvcshjcvjhvsjchvcksdvckjhvgjcvskj bksjd vjh vjvjh v jhvjh"
            }
          />
          <BlogItemColumn
            img={
              "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png"
            }
            title={"sdbdbvds"}
            author={"sdvdv sdvdv"}
            date={"svvvwevw"}
            time={"sdvdvvvv"}
            content={
              "jhdcjhvckhvhcvckhdsvckhsagcvakhcgvscjhvcjsvcjscvjhcvsjcvsjhvjhdvsjhvcjxhcsjvhcbjhvbdsjhvbwjhbvdjsdhcbvjhwvbjhcdhj cjhvcjhvc jadshvjhvcjhqc jhvjhc jac hsvxjhvs jh vdjhvsjv hxjhvcasjd hasjhxzvjhsd cjs hvxjhcvjhcvsjhxvjhcvjhcvsjhxcvsjhvcjcvschjvsjhvsjhvcshjcvjhvsjchvcksdvckjhvgjcvskj bksjd vjh vjvjh v jhvjh"
            }
          />
          <BlogItemColumn
            img={
              "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png"
            }
            title={"sdbdbvds"}
            author={"sdvdv sdvdv"}
            date={"svvvwevw"}
            time={"sdvdvvvv"}
            content={
              "jhdcjhvckhvhcvckhdsvckhsagcvakhcgvscjhvcjsvcjscvjhcvsjcvsjhvjhdvsjhvcjxhcsjvhcbjhvbdsjhvbwjhbvdjsdhcbvjhwvbjhcdhj cjhvcjhvc jadshvjhvcjhqc jhvjhc jac hsvxjhvs jh vdjhvsjv hxjhvcasjd hasjhxzvjhsd cjs hvxjhcvjhcvsjhxvjhcvjhcvsjhxcvsjhvcjcvschjvsjhvsjhvcshjcvjhvsjchvcksdvckjhvgjcvskj bksjd vjh vjvjh v jhvjh"
            }
          />
          <BlogItemColumn
            img={
              "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png"
            }
            title={"sdbdbvds"}
            author={"sdvdv sdvdv"}
            date={"svvvwevw"}
            time={"sdvdvvvv"}
            content={
              "jhdcjhvckhvhcvckhdsvckhsagcvakhcgvscjhvcjsvcjscvjhcvsjcvsjhvjhdvsjhvcjxhcsjvhcbjhvbdsjhvbwjhbvdjsdhcbvjhwvbjhcdhj cjhvcjhvc jadshvjhvcjhqc jhvjhc jac hsvxjhvs jh vdjhvsjv hxjhvcasjd hasjhxzvjhsd cjs hvxjhcvjhcvsjhxvjhcvjhcvsjhxcvsjhvcjcvschjvsjhvsjhvcshjcvjhvsjchvcksdvckjhvgjcvskj bksjd vjh vjvjh v jhvjh"
            }
          />
          <BlogItemColumn
            img={
              "https://code.visualstudio.com/assets/docs/getstarted/tips-and-tricks/keyboard-shortcuts.png"
            }
            title={"sdbdbvds"}
            author={"sdvdv sdvdv"}
            date={"svvvwevw"}
            time={"sdvdvvvv"}
            content={
              "jhdcjhvckhvhcvckhdsvckhsagcvakhcgvscjhvcjsvcjscvjhcvsjcvsjhvjhdvsjhvcjxhcsjvhcbjhvbdsjhvbwjhbvdjsdhcbvjhwvbjhcdhj cjhvcjhvc jadshvjhvcjhqc jhvjhc jac hsvxjhvs jh vdjhvsjv hxjhvcasjd hasjhxzvjhsd cjs hvxjhcvjhcvsjhxvjhcvjhcvsjhxcvsjhvcjcvschjvsjhvsjhvcshjcvjhvsjchvcksdvckjhvgjcvskj bksjd vjh vjvjh v jhvjh"
            }
          />
        </SimpleGrid>
      </Container>
    </Layout>
  );
};

export default BlogPage;
