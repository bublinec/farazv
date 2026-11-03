/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React, { memo, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { get, upperFirst } from "lodash";
import { auth, LoadingIndicatorPage } from "strapi-helper-plugin";
import PageTitle from "../../components/PageTitle";
import { useModels } from "../../hooks";

import useFetch from "./hooks";
import {
  ALink,
  Block,
  Container,
  LinkWrapper,
  P,
  Wave,
  Separator,
} from "./components";
import BlogPost from "./BlogPost";
import SocialLink from "./SocialLink";

const FIRST_BLOCK_LINKS = [
  {
    link: "https://farazv.sk/docs",
    title: "Prečítať dokumentáciu",
    content: "Naučte sa pridávať obsah na stránku.",
  },
  {
    link: "https://github.com/bublinec/farazv-client",
    title: "Pozireť si kód",
    content: "Kód je zverejnený na Githube",
  },
];

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    link: "https://www.facebook.com/fara.zv.mesto",
  },
  {
    name: "YouTube",
    link: "https://www.youtube.com/channel/UCbbuJ74HrU-jhc6xpNiXXfw",
  },
  {
    name: "Farská stránka (frontend)",
    link: "http://www.farazv.sk/",
  },
  {
    name: "Momentum Digital",
    link: "https://momentumdigital.sk",
  },
];

const HomePage = ({ history: { push } }) => {
  const { error, isLoading, posts } = useFetch();
  // Temporary until we develop the menu API
  const {
    collectionTypes,
    singleTypes,
    isLoading: isLoadingForModels,
  } = useModels();

  const handleClick = (e) => {
    e.preventDefault();

    push(
      "/plugins/content-type-builder/content-types/plugins::users-permissions.user?modalType=contentType&kind=collectionType&actionType=create&settingType=base&forTarget=contentType&headerId=content-type-builder.modalForm.contentType.header-create&header_icon_isCustom_1=false&header_icon_name_1=contentType&header_label_1=null"
    );
  };

  const hasAlreadyCreatedContentTypes = useMemo(() => {
    const filterContentTypes = (contentTypes) =>
      contentTypes.filter((c) => c.isDisplayed);

    return (
      filterContentTypes(collectionTypes).length > 1 ||
      filterContentTypes(singleTypes).length > 0
    );
  }, [collectionTypes, singleTypes]);

  if (isLoadingForModels) {
    return <LoadingIndicatorPage />;
  }

  const headerId = hasAlreadyCreatedContentTypes
    ? "HomePage.greetings"
    : "app.components.HomePage.welcome";
  const username = get(auth.getUserInfo(), "firstname", "");
  const linkProps = hasAlreadyCreatedContentTypes
    ? {
        id: "app.components.HomePage.button.blog",
        href: "https://strapi.io/blog/",
        onClick: () => {},
        type: "blog",
        target: "_blank",
      }
    : {
        id: "app.components.HomePage.create",
        href: "",
        onClick: handleClick,
        type: "documentation",
      };

  return (
    <>
      <FormattedMessage id="HomePage.helmet.title">
        {(title) => <PageTitle title={title} />}
      </FormattedMessage>
      <Container className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-md-12">
            <Block>
              <Wave />
              <FormattedMessage
                id={headerId}
                values={{
                  name: upperFirst(username),
                }}
              >
                {(msg) => <h2 id="mainHeader">{msg}</h2>}
              </FormattedMessage>
              {hasAlreadyCreatedContentTypes ? (
                <P>Vitaj späť!</P>
              ) : (
                <P>Vitaj!</P>
              )}

              <h2 style={{ marginTop: 17, marginBottom: 12 }}>
                Toto je adminovská aplikácia ktorá slúži na menežment obsahu na
                našerj farskej stránke.
              </h2>
              <p>Prajeme príjmené editvoanie.</p>
              <p>Momentum Digital</p>
              {/* Button */}
              {/* <FormattedMessage id={linkProps.id}>
                {(msg) => (
                  <ALink
                    rel="noopener noreferrer"
                    {...linkProps}
                    style={{ verticalAlign: " bottom", marginBottom: 5 }}
                  >
                    {msg}
                  </ALink>
                )}
              </FormattedMessage> */}

              <Separator style={{ marginTop: 37, marginBottom: 36 }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {FIRST_BLOCK_LINKS.map((data, index) => {
                  const type = index === 0 ? "doc" : "code";

                  return (
                    <LinkWrapper
                      href={data.link}
                      target="_blank"
                      key={data.link}
                      type={type}
                    >
                      <p className="bold">{data.title}</p>
                      <p>{data.content}</p>
                    </LinkWrapper>
                  );
                })}
              </div>
            </Block>
          </div>

          <div className="col-md-12 col-lg-4">
            <Block style={{ paddingRight: 30, paddingBottom: 0 }}>
              <h2>Užitočné linky</h2>
              <P>Menežment iných platforiem a podpora</P>
              <Separator style={{ marginTop: 18 }} />
              <div
                className="row social-wrapper"
                style={{
                  display: "flex",
                  margin: 0,
                  marginTop: 36,
                  marginLeft: -15,
                }}
              >
                {SOCIAL_LINKS.map((value, key) => (
                  <SocialLink key={key} {...value} />
                ))}
              </div>
            </Block>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);
