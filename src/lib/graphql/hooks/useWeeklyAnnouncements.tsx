import { graphql, useStaticQuery } from "gatsby";

export const useWeeklyAnnouncements = (): any => {
  const data = useStaticQuery(graphql`
    query useWeeklyAnnouncements {
      strapiWeeklyAnnouncements {
        monday {
          isMajorFeast
          liturgy
          masses {
            intention
            priest {
              name
              role
              surname
            }
            time
          }
        }
        announcements {
          text
        }
        donations {
          weddings {
            amount
            name
          }
        }
      }
    }
  `);

  return data.strapiWeeklyAnnouncements;
};
