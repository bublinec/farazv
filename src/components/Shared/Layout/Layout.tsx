import { Box } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { ReactNode } from "react";
import { Hero } from "../../Home/Hero/Hero";
import { Footer } from "../Footer/Footer";
import { MiniHero } from "../MiniHero/MiniHero";
import { SEO } from "../SEO/SEO";
import "./global.css";
interface LayoutProps {
  home?: boolean;
  page?: Page.StrapiPage;
  children: ReactNode | ReactNode[];
}

const Layout = (props: LayoutProps) => {
  const { page, children, home = false } = props;

  return (
    <Box>
      <SEO
        description={page?.content}
        title={page?.title}
        image={page?.image?.url}
      />
      {home ? <Hero /> : page?.image && <MiniHero image={page?.image} title={page?.title} />}
      <main>{children}</main>
      <Footer />
    </Box>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
