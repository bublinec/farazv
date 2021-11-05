import { Box, Flex } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { ReactNode } from "react";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import "./global.css";

interface LayoutProps {
  noHeader?: boolean;
  children: ReactNode | ReactNode[];
}

const Layout = (props: LayoutProps) => {
  const { children, noHeader = false } = props;

  return (
    <Flex
      width="full"
      minHight="screen"
      justify="space-between"
      flexDir="column"
    >
      <Box>
        {!noHeader && <Header />}
        <main>{children}</main>
      </Box>
      <Footer />
    </Flex>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
