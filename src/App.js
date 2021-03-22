import styled from "styled-components";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { ApartmentCalcPage } from "./components/pages/apartmentCalcPage";
import { SandBoxPage } from "./components/pages/sandBoxPage";
import { MultipleScenePage } from "./components/pages/multipleScenePage";
import { ReflectorPostProcessPage } from "./components/pages/reflectorPostProcessPage";
import { ApartmentCalcPostReflectorPage } from "./components/pages/apartmentCalcPostReflectorPage";

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
            <StyledLink to="/multiplescene">MultipleScene</StyledLink>
            <StyledLink to="/rfPost">Reflector PostProcess</StyledLink>
            <StyledLink to="/apCalcPostRef">Apartment Calc Post Reflector</StyledLink>
          </LinkWrapper>
          <Switch>
            <Route exact path="/">
              <ApartmentCalcPage/>
            </Route>
            <Route path="/sandbox">
              <SandBoxPage/>
            </Route>
            <Route path="/multiplescene">
              <MultipleScenePage/>
            </Route>
            <Route path="/rfPost">
              <ReflectorPostProcessPage/>
            </Route>
            <Route path="/apCalcPostRef">
              <ApartmentCalcPostReflectorPage/>
            </Route>
          </Switch>
        </Router>
      </AppWrapper>
  );
}

export default App;
