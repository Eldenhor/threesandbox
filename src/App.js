import styled from "styled-components";
import { BrowserRouter as Router, Route, Link, Switch} from "react-router-dom";
import { ApartmentCalcPage } from "./components/pages/apartmentCalcPage";
import { SandBoxPage } from "./components/pages/sandBoxPage";

const AppWrapper = styled.div`
  margin: 40px;
`;

const LinkWrapper = styled.div`
  padding: 8px;
  margin: 16px;
`;

const StyledLink = styled(Link)`
  padding: 8px;
  background-color: lightgrey;
  text-decoration: none;
  margin-right: 16px;
  color: black
`;

function App() {

  return (
      <AppWrapper>
        <Router>
          <LinkWrapper>
            <StyledLink to="/">Apartment Calc</StyledLink>
            <StyledLink to="/sandbox">Sandbox</StyledLink>
          </LinkWrapper>
          <Switch>
            <Route exact path="/">
              <ApartmentCalcPage/>
            </Route>
            <Route path="/sandbox">
              <SandBoxPage/>
            </Route>
          </Switch>
        </Router>
      </AppWrapper>
  );
}

export default App;
