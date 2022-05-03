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
      <Center w='full' py={20} pb={40} >
        <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSeN1zMMwjp661ni4f0gwnNr6x4IxBQgmNsWB9bSxWqFCd1HQA/viewform?embedded=true?hl=sk" width="640" height="534"  style={{marginBottom: "-20px", overflowY: "hidden"}}>Loading…</iframe>
      </Center>
    </Layout>
  );
};

export default DFRPage;