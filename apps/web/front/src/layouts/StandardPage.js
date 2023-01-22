import React from 'react';
import { Container, Content } from 'react-bulma-components';
import { Helmet } from 'react-helmet-async';
import { TopNavbar } from '@kreyolopal/web-ui';
import { findByType } from '@kreyolopal/ui-utils';
import LanguageProvider from './LanguageContext';

const _Footer = () => null;
_Footer.componentName = "_Footer"
const _Head = ({ title, description, children }) => null;
_Head.componentName = "_Head"

export const StandardPage = ({ children, lang, ...props }) => {
  const PageFooter = () => {
    const footer = findByType(children, _Footer);

    return (
      <LanguageProvider lang={lang || 'fr'}>
        <Container
          max
          breakpoint="fullhd"
          textAlign="center"
          className="page-footer"
          renderAs="footer"
        >
          {footer?.props.children}
          <Content>&copy; TiMalo — 2022</Content>
        </Container>
      </LanguageProvider>
    );
  };

  const PageHead = () => {
    const _head = findByType(children, _Head, true);
    return _head !== undefined ? (
      <Helmet>
        <title>{_head.props.title}</title>
        <meta name="description" content={_head.props.description} />
        {_head.props.children}
      </Helmet>
    ) : (
      ' '
    );
  };

  return (
    <>
      <PageHead />
      <TopNavbar />

      <Container {...props} className="main" renderAs="main">
        {children}
      </Container>

      <PageFooter />
    </>
  );
};

StandardPage.Head = _Head;
StandardPage.Footer = _Footer;

export default StandardPage;
