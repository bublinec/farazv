import { graphql, useStaticQuery } from "gatsby";
import { Announcement } from "../model/announcement.model";

export const useAnnouncements = (): Announcement[] => {
  const data = useStaticQuery(graphql`
    query useAnnouncements {
      allStrapiAnnouncements {
        nodes {
          description
          content
          slug
          title
          published_at
        }
      }
    }
  `);

  return data.allStrapiAnnouncements.nodes;
};
