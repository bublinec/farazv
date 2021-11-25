import { graphql, useStaticQuery } from "gatsby";
import { Announcement } from "../model/announcement.model";

export const useAnnouncements = (): Announcement[] => {
  const data = useStaticQuery(graphql`
    query useAnnouncements {
      allStrapiAnnouncements(limit: 4) {
        nodes {
          ...StrapiAnnouncementsFragment
        }
      }
    }
  `);

  return data.allStrapiAnnouncements.nodes;
};
