import { Stack } from "@chakra-ui/react";
import React from "react";
import { AnnouncementsSection } from "../components/Home/Announcements/AnnouncementsSection";
import { Container } from "../components/Shared/Container/Container";
import Layout from "../components/Shared/Layout/Layout";
import { SEO } from "../components/Shared/SEO/SEO";

const HomePage = () => (
  <Layout home>
    <SEO description="This is an Home page" />
    <Container className="py-12 md:py-20">
      <Stack spacing={{ base: 6, md: 12 }}>
        <AnnouncementsSection />
      </Stack>
    </Container>
  </Layout>
);

export default HomePage;
