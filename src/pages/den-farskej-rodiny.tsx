import { Center, Container } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";

import Layout from "../components/Shared/Layout/Layout";
import { Iframe } from "../components/Shared/Iframe/Iframe";
import { SectionHeading } from "../components/Shared/SectionHeading/SectionHeading";

export const query = graphql`
  query useDFRPage {
    STRAPI {
      adminPages(where: { slug: "den-farskej-rodiny" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const DFRPage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];

  return (
    <Layout page={page}>
      <Container maxW={930} pt={{ base: 8, md: 20 }}>
        <SectionHeading heading={"Promo video"} superscript="Deň farnosti" />

        <Iframe
          url={
            "https://drive.google.com/file/d/1LwDaSBdhltoPHNigqxt9JDbKgcQvEd_0/preview"
          }
        />
        <SectionHeading
          heading={"Prihlasovanie"}
          superscript="Deň farnosti"
          pt={20}
        />
      </Container>

      <Center w="full" pb={40}>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdDELp7_AQPXZ_InnR-vcTHLMVvDcOlCRWiyJg3lFMkfLA3cg/viewform?usp=header"
          width="900"
          height="1300"
          style={{ overflowY: "hidden" }}
        >
          Loading…
        </iframe>
      </Center>
    </Layout>
  );
};

export default DFRPage;
