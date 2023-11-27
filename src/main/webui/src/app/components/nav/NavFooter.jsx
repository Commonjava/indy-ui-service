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

import React, {useEffect, useState} from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {jsonRest} from '../../utils/RestClient';
import {Utils} from '../../utils/AppUtils';

export default function NavFooter() {
  const [state, setState] = useState({stats: {}});

  (function(){
    const versionUrl = `/api/stats/version-info`;
    useEffect(()=>{
      const fetchVersion = async () => {
        const response = await jsonRest.get(versionUrl);
        if (response.ok){
          const raw = await response.json();
          setState({
            stats: raw
          });
        }else{
          response.text().then(data => {
            Utils.logMessage(`Failed to version info. Error reason: ${response.status}->${data}`);
          });
        }
      };

      fetchVersion();
    }, []);
  }());

  const stats = state.stats;
  const gridClass = "col-md-auto border-right border-secondary";
  return (
    <Navbar expand="lg" className="bg-body-tertiary fixed-bottom">
      <Container>
        <Row>
          <Col className={gridClass}>
            <a target="_new" href="http://commonjava.github.io/indy/">Docs</a>
          </Col>{" | "}
          <Col className={gridClass}>
            <a target="_new" href="http://github.com/commonjava/indy/issues">Issues</a>
          </Col>{" | "}
          <Col className={gridClass}>Version:{stats.version}</Col>{" | "}
          <Col className={gridClass}>
            Commit ID: <a target="_new" href={`http://github.com/commonjava/indy/commit/${stats.commitId}`}>{stats.commitId}</a>
          </Col>{" | "}
          <Col className="col-md-auto">
            Built on {stats.timestamp} by <a target="_new" href={`http://github.com/${stats.builder}`}>{stats.builder}</a>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
}
