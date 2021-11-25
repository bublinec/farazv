import { graphql } from "gatsby";

export const ANNOUNCEMENT_FRAGMENT = graphql`
  fragment StrapiAnnouncementsFragment on StrapiAnnouncements {
    description
    content
    slug
    title
    published_at
  }
`;
