/**
 *
 * SocialLink
 */

import React, { memo } from "react";
import PropTypes from "prop-types";

import Gh from "../../assets/images/social_gh.png";
import Youtube from "../../assets/images/social_youtube.png";
import Momentum from "../../assets/images/social_momentum.png";
import Facebook from "../../assets/images/social_facebook.png";
import Strapi from "../../assets/images/social_strapi.png";

import { SocialLinkWrapper } from "./components";

function getSrc(name) {
  switch (name) {
    case "GitHub":
      return Gh;
    case "Facebook":
      return Facebook;
    case "YouTube":
      return Youtube;
    case "Twitter":
      return Twitter;
    case "Momentum Digital":
      return Momentum;
    case "Blog":
    case "Forum":
    case "Careers":
      return Strapi;
    default:
      return Strapi;
  }
}

const SocialLink = ({ link, name }) => {
  return (
    <SocialLinkWrapper className="col-6">
      <a href={link} target="_blank" rel="noopener noreferrer">
        <img src={getSrc(name)} alt={name} />
        <span>{name}</span>
      </a>
    </SocialLinkWrapper>
  );
};

SocialLink.propTypes = {
  link: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default memo(SocialLink);
