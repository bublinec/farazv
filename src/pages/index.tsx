import { Stack } from "@chakra-ui/react";
import React from "react";
import { AnnouncementsSection } from "../components/Home/Announcements/AnnouncementsSection";
import { Hero } from "../components/Home/Hero/Hero";
import { Container } from "../components/Shared/Container/Container";
import Layout from "../components/Shared/Layout/Layout";
import { SEO } from "../components/Shared/SEO/SEO";

const HomePage = () => (
  <Layout noHeader>
    <SEO description="This is an Home page" />
    <Hero />
    <Container className="py-14">
      <Stack spacing={{ base: 6, md: 12 }}>
        <AnnouncementsSection />
      </Stack>
    </Container>
  </Layout>
);

export default HomePage;
