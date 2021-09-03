import PropTypes from "prop-types";
import React from "react";
import { Footer } from "../Footer/Footer";
import { Header } from "../Header/Header";
import "./global.css";

const Layout = ({ children }) => {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
