import { Center } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";

import Layout from "../components/Shared/Layout/Layout";

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
      <Center w="full" py={20} pb={{ xs: 10, md: -40 }}>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdDELp7_AQPXZ_InnR-vcTHLMVvDcOlCRWiyJg3lFMkfLA3cg/viewform?usp=header"
          width="640"
          height="1300"
          style={{ marginBottom: "-20px", overflowY: "hidden" }}
        >
          Loading…
        </iframe>
      </Center>
    </Layout>
  );
};

export default DFRPage;
