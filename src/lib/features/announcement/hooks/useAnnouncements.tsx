import { graphql, useStaticQuery } from "gatsby";
import { Announcement } from "../model/announcement.model";

export const useAnnouncements = (): Announcement[] => {
  const data = useStaticQuery(graphql`
    query useAnnouncements {
      allStrapiAnnouncements {
        nodes {
          ...StrapiAnnouncementsFragment
        }
      }
    }
  `);

  return data.allStrapiAnnouncements.nodes;
};
