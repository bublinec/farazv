import { Flex, SimpleGrid, Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { Container } from "../../components/Shared/Container/Container";
import Layout from "../../components/Shared/Layout/Layout";
import { SectionHeading } from "../../components/Shared/SectionHeading/SectionHeading";
import { Donations } from "../../components/WeeklyAnnouncements/Donations/Donations";
import { MassSchedule } from "../../components/WeeklyAnnouncements/MassSchedule/MassSchedule";
import { useWeeklyAnnouncements } from "../../lib/graphql/hooks/useWeeklyAnnouncements";

export const query = graphql`
  query useWeeklyAnnouncementsPage {
    STRAPI {
      adminPages(where: { slug: "farske-oznamy" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const WeeklyAnnouncementsPage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];

  const data = useWeeklyAnnouncements();

  return (
    <Layout page={page} >
      <SimpleGrid className="py-12 md:py-20"  column={1}>
        <Flex spacing={{ base: 6, md: 12 }} columns={{ base: 1, md: 2}} >
          <MassSchedule/>          
          <Donations donations={data.donations} />
        </Flex>
      </SimpleGrid>
    </Layout>
  );
};

export default WeeklyAnnouncementsPage;
