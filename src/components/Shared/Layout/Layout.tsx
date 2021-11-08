import { Box } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { ReactNode } from "react";
import { Hero } from "../../Home/Hero/Hero";
import { Footer } from "../Footer/Footer";
import { MiniHero } from "../MiniHero/MiniHero";
import "./global.css";

interface LayoutProps {
  home?: boolean;
  heroImage?: any;
  heroTitle?: string;
  children: ReactNode | ReactNode[];
}

const Layout = (props: LayoutProps) => {
  const { heroImage, heroTitle, children, home = false } = props;

  return (
    <Box>
      {home ? <Hero /> : <MiniHero image={heroImage} title={heroTitle} />}
      <main>{children}</main>
      <Footer />
    </Box>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
