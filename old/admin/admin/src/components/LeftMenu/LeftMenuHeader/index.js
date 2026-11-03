import React from "react";
import { Link } from "react-router-dom";

import Wrapper from "./Wrapper";

const LeftMenuHeader = () => (
  <Wrapper>
    <Link to="/" className="leftMenuHeaderLink">
      <span className="projectName">
        <div style={{ paddingTop: "16px", fontSize: "20px" }}>Farazv Admin</div>
      </span>
    </Link>
  </Wrapper>
);

export default LeftMenuHeader;
