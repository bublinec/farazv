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
          infoNote
        }
        SacramentPreparationMettings {
          meeting {
            name
            time
          }
          infoNote
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
          infoNote
        }
      }
    }
  `);

  return data.strapiContact;
};
