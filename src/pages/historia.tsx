import { Button } from "@/components/Shared/Button/Button";
import React from "react";
import { Container } from "../components/Shared/Container/Container";
import Layout from "../components/Shared/Layout/Layout";
import { SEO } from "../components/Shared/SEO/SEO";

const IndexPage = () => (
  <Layout>
    <SEO description="This is an index page" />
    <Container className="py-20 text-3xl text-red-500">
      <span >Historia</span>
      <Button>Lolo</Button>
    </Container>
  </Layout>
);

export default IndexPage;