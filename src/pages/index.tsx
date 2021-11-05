import React from "react";
import { Hero } from "../components/Home/Hero/Hero";
import { Container } from "../components/Shared/Container/Container";
import Layout from "../components/Shared/Layout/Layout";
import { SEO } from "../components/Shared/SEO/SEO";

const HomePage = () => (
  <Layout noHeader>
    <SEO description="This is an Home page" />
    <Hero />
    <Container className="py-20">
      <span>Hello this Farazv</span>
    </Container>
  </Layout>
);

export default HomePage;
