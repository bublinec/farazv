import { graphql, useStaticQuery } from "gatsby";

export const useWeeklyAnnouncements =
  (): WeeklyAnnouncements.WeeklyAnnouncements[] => {
    const data = useStaticQuery(graphql`
      query useWeeklyAnnouncements {
        allStrapiWeeklyAnnouncements(limit: 2) {
          nodes {
            monday {
              date
              liturgy
              masses {
                intention
                label
                time
                priest {
                  surname
                }
              }
            }
            tuesday {
              date
              liturgy
              masses {
                intention
                label
                time
                priest {
                  surname
                }
              }
            }
            wednesday {
              date
              liturgy
              masses {
                intention
                label
                time
                priest {
                  surname
                }
              }
            }
            thursday {
              date
              liturgy
              masses {
                intention
                label
                time
                priest {
                  surname
                }
              }
            }
            friday {
              date
              liturgy
              masses {
                intention
                label
                time
                priest {
                  surname
                }
              }
            }
            saturday {
              date
              liturgy
              masses {
                intention
                label
                time
                priest {
                  surname
                }
              }
            }
            sunday {
              date
              liturgy
              masses {
                intention
                label
                time
                priest {
                  surname
                }
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
              baptism {
                amount
                name
              }
              funerals {
                amount
                name
              }
              urnBurials {
                amount
                name
              }
              other {
                amount
                name
              }
            }
          }
        }
      }
    `);

    return data.allStrapiWeeklyAnnouncements.nodes;
  };
