import styled from "styled-components";

const A = styled.a`
  display: flex;
  position: relative;
  padding-top: 0.7rem;
  padding-bottom: 0.2rem;
  padding-left: 1.6rem;
  min-height: 3.6rem;
  border-left: 0.3rem solid transparent;
  cursor: pointer;
  color: #fff;
  text-decoration: none;
  -webkit-font-smoothing: antialiased;

  &:hover {
    background: ${(props) => props.theme.main.colors.leftMenu["link-hover"]};
    color: #fff !important;

    border-left: 0.3rem solid ${(props) => props.theme.main.colors.tca.primary};
    text-decoration: none;
  }

  &:focus {
    color: #fff;
    text-decoration: none;
  }

  &:visited {
    color: #fff;
  }

  &.linkActive {
    color: #fff !important;
    font-weight: 600;
    border-left: 0.3rem solid ${(props) => props.theme.main.colors.tca.primary};
  }
`;

export default A;
