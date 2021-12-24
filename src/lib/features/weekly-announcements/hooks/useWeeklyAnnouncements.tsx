import { graphql, useStaticQuery } from "gatsby";

export const useWeeklyAnnouncements =
  (): WeeklyAnnouncements.WeeklyAnnouncements[] => {
    const data = useStaticQuery(graphql`
      query useWeeklyAnnouncements {
        allStrapiWeeklyAnnouncements(
          limit: 10
          sort: { fields: updated_at, order: DESC }
        ) {
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
                otherPriests
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
                otherPriests
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
                otherPriests
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
                otherPriests
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
                otherPriests
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
                otherPriests
              }
            }
            announcements {
              text
            }
            donations {
              funerals {
                amount
                name
              }
              weddings {
                amount
                name
              }
              baptism {
                amount
                name
              }
              charity {
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
