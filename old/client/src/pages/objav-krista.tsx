import { Box } from "@chakra-ui/react";
import { Center } from "@chakra-ui/react";
import { graphql } from "gatsby";
import Layout from "../components/Shared/Layout/Layout";
import * as React from 'react';


export const query = graphql`
  query useJesusCoursePage {
    STRAPI {
      adminPages(where: { slug: "objav-krista" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const JesusCoursePage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];

  return (
    <Layout page={page}>
      <Center w="full" py={20} pb={40}>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdLHclCQkOjBSldcKlFdaEf6FC4rNLKEnROGPWCnPMUMrd_Cw/viewform?embedded=true"
          width="640"
          height="534"
          style={{ marginBottom: "-20px", overflowY: "hidden" }}
        >
          Loading…
        </iframe>
      </Center>
    </Layout>
  );
};

export default JesusCoursePage;
