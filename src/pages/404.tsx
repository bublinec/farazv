import { Stack } from "@chakra-ui/react";
import React from "react";
import { Container } from "../components/Shared/Container/Container";
import Layout from "../components/Shared/Layout/Layout";

const NotFoundPage = () => (
  <Layout>
    <Container className="py-12 md:py-20">
      <Stack spacing={{ base: 6, md: 12 }}>Zdá sa že ste sa stratili</Stack>
    </Container>
  </Layout>
);

export default NotFoundPage;
