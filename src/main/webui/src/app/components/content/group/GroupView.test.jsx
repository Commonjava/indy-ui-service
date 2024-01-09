/* eslint-disable camelcase */
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

import React from "react";
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {render, screen, cleanup, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock from "fetch-mock";
import GroupView from "./GroupView.jsx";
import {STORE_API_BASE_URL} from "../../ComponentConstants.js";

beforeEach(()=>{
  fetchMock.restore();
});

afterEach(() => {
  cleanup();
});

describe('GroupView tests', () => {
  it("Verify GroupView", async ()=>{
    const mockGroup = {name: "public", type: "group", packageType: "maven",
    key: "maven:group:public", disabled: false,
    description: "official maven public",
    constituents: ["maven:remote:central", "maven:hosted:local-deployment"]};
    const mockDisableTimeout = {name: "Disable-Timeout", group: "maven:group:public#Disable-Timeout",
    expiration: "2030-02-22T17:00:00.000Z"};
    fetchMock.mock(`${STORE_API_BASE_URL}/maven/group/public`, {status: 200, body: JSON.stringify(mockGroup)});
    fetchMock.mock("/api/admin/schedule/store/maven/group/public/disable-timeout", {status: 200, body: JSON.stringify(mockDisableTimeout)});
    render(<MemoryRouter initialEntries={["/group/maven/view/public"]}>
      <Routes>
        <Route path="/group/:packageType/view/:name" element={<GroupView />} />
      </Routes>
    </MemoryRouter>);

    await waitFor(() => {
      // Control section testing
      expect(screen.getByRole("button", {name: "New..."})).toBeInTheDocument();

      // StoreView: Basic section testing
      expect(screen.getByText("Package Type:")).toBeInTheDocument();
      expect(screen.getByText(mockGroup.packageType, {selector: "span"})).toBeInTheDocument();
      expect(screen.getByText("Name:")).toBeInTheDocument();
      expect(screen.getByText(mockGroup.name, {selector: "span"})).toBeInTheDocument();

      // StoreView: Constituents section testing
      expect(screen.getByText("maven:remote:central", {selector: "a"})).toBeInTheDocument();
      expect(screen.getByText("maven:hosted:local-deployment", {selector: "a"})).toBeInTheDocument();
    });
  });
});
