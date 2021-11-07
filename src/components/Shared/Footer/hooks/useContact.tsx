import { graphql, useStaticQuery } from "gatsby";

export const useContact = (): Contact.Contact => {
  const data = useStaticQuery(graphql`
    query useContact {
      strapiContact {
        officeHours {
          officeDay {
            day
            id
            openTime
          }
        }
        SacramentPreparationMettings {
          meeting {
            name
            time
          }
        }
        contactDetails {
          address
          email
          googleMapEmbedLink
          googleMapLink
          iban
          ico
          id
          mobil
          phone
        }
      }
    }
  `);

  return data.strapiContact;
};
