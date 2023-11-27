/**
 * Copyright (C) 2023 Red Hat, Inc. (https://github.com/Commonjava/indy-ui-service)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {LinkContainer} from 'react-router-bootstrap';

// TODO: This is mock user login, need to implement later for real login
const isUserloggedIn = true;
const username = "mock";

// eslint-disable-next-line max-lines-per-function
export default function NavHeader(){
  return (
    <Navbar expand="lg" className="bg-body-tertiary fixed-top">
      <Container fluid>
        <LinkContainer key="link-home" to="">
          <Navbar.Brand>Indy</Navbar.Brand>
        </LinkContainer>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
          {
            [
              {type: "remote", desc: "Remote Repositories"},
              {type: "hosted", desc: "Hosted Repositories"},
              {type: "group", desc: "Groups"}
            ].map(o =><NavDropdown key={`dropdown-${o.type}`} title={o.desc} id={`dropdown-button-dark-${o.type}`}>
                {
                  ["maven", "generic-http", "npm"].map(pkgType => <LinkContainer key={`link-${pkgType}`} to={`/${o.type}/${pkgType}`}>
                      <NavDropdown.Item>{pkgType}</NavDropdown.Item>
                    </LinkContainer>)
                }
            </NavDropdown>)
          }
            <Nav.Link href="/q/swagger-ui">REST API</Nav.Link>
            <NavDropdown title="More" id="addon-more">
              <LinkContainer to="/nfc">
                <NavDropdown.Item>Not-Found Cache</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/cache/delete">
                <NavDropdown.Item>Delete Cache</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
          </Nav>
          { isUserloggedIn && <Nav className="ms-auto">
              <NavDropdown title={username} id="username">
                <NavDropdown.Item href="/logout" variant="link">Log Out</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          }
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
