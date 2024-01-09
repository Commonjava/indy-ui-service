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
import {render, screen, cleanup, waitFor, within} from '@testing-library/react';
import '@testing-library/jest-dom';
import fetchMock from "fetch-mock";
import RemoteEdit from "./RemoteEdit.jsx";
import {STORE_API_BASE_URL} from "../../ComponentConstants.js";

beforeEach(()=>{
  fetchMock.restore();
  fetchMock.mock(
    "/api/stats/package-type/keys",
    {status: 200, body: JSON.stringify(["maven", "npm", "generic-http"])}
  );
});

afterEach(() => {
  cleanup();
});

describe('RemoteEdit tests', () => {
  it("Verify RemoteEdit for new mode", async ()=>{
    render(<MemoryRouter initialEntries={["/remote/new"]}>
      <Routes>
        <Route path="/remote/new" element={<RemoteEdit />} />
      </Routes>
    </MemoryRouter>);

    await waitFor(() => {
      // ListControl section testing
      expect(screen.getByRole("button", {name: "Save"})).toBeInTheDocument();
      expect(screen.getByRole("button", {name: "Cancel"})).toBeInTheDocument();

      // Basic section testing
      expect(screen.getByRole("option", {name: "maven"})).toBeInTheDocument();
      expect(screen.getByRole("option", {name: "npm"})).toBeInTheDocument();
      expect(screen.getByRole("option", {name: "generic-http"})).toBeInTheDocument();
      expect(screen.getByRole("option", {name: ""}).selected).toBe(true);
      expect(screen.getByRole("pkgTypeSel")).toHaveValue("");

      expect(screen.getByText("Name:")).toBeInTheDocument();
      let parentDiv = screen.getByText("Name:").closest("div");
      expect(within(parentDiv).getByRole("textbox")).toHaveAttribute("name", "name");
      expect(screen.getByText("Enabled?")).toBeInTheDocument();
      parentDiv = screen.getByText("Enabled?").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toHaveAttribute("name", "enabled");
      expect(screen.getByText("Authoritative content Index?")).toBeInTheDocument();
      parentDiv = screen.getByText("Authoritative content Index?").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toHaveAttribute("name", "authoritative_index");

      // Capabilities section testing
      parentDiv = screen.getByText("Allow Releases").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toHaveAttribute("name", "allow_releases");
      parentDiv = screen.getByText("Allow Snapshots").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toHaveAttribute("name", "allow_snapshots");

    });
  });

  it("Verify RemoteEdit for edit mode", async ()=>{
    const mockRemoteStore = {name: "central", type: "remote", packageType: "maven",
    key: "maven:remote:central", disabled: false, "allow_snapshots": true,
    "allow_releases": true, url: "https://repo.maven.apache.org/maven2/",
    authoritative_index: true, description: "official maven central",
    server_certificate_pem: "lksjdflksjdfl", key_certificate_pem: "kjlkjlkjlsdfsdf",
    key_password: "654321",
    proxy_host: "https://test.proxy.server/", proxy_port: 8010,
    user: "testuser", password: "123456"};
    const mockDisableTimeout = {name: "Disable-Timeout", group: "maven:remote:central#Disable-Timeout",
    expiration: "2030-02-22T17:00:00.000Z"};
    fetchMock.mock(`${STORE_API_BASE_URL}/maven/remote/central`, {status: 200, body: JSON.stringify(mockRemoteStore)});
    fetchMock.mock("/api/admin/schedule/store/maven/remote/central/disable-timeout", {status: 200, body: JSON.stringify(mockDisableTimeout)});
    render(<MemoryRouter initialEntries={["/remote/maven/edit/central"]}>
      <Routes>
        <Route path="/remote/:packageType/edit/:name" element={<RemoteEdit />} />
      </Routes>
    </MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText("Package Type:")).toBeInTheDocument();
      expect(screen.getByText(mockRemoteStore.packageType, {selector: "span"})).toBeInTheDocument();
      expect(screen.getByText("Name:")).toBeInTheDocument();
      expect(screen.getByText(mockRemoteStore.name, {selector: "span"})).toBeInTheDocument();
      expect(screen.getByText("Enabled?")).toBeInTheDocument();
      let parentDiv = screen.getByText("Enabled?").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toHaveAttribute("name", "enabled");
      parentDiv = screen.getByText("Authoritative content Index?").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toBeChecked();

      // Capabilities section testing
      parentDiv = screen.getByText("Allow Releases").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toBeChecked();
      parentDiv = screen.getByText("Allow Snapshots").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toBeChecked();

      // Remote access section testing
      parentDiv = screen.getByText("Use Proxy?").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toBeChecked();
      parentDiv = screen.getByText("Proxy Host:").closest("div");
      expect(within(parentDiv).getByRole("textbox")).toHaveValue(mockRemoteStore.proxy_host);
      parentDiv = screen.getByText("Proxy Port:").closest("div");
      expect(within(parentDiv).getByRole("textbox")).toHaveValue(`${mockRemoteStore.proxy_port}`);
      parentDiv = screen.getByText("Use Authentication?").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toBeChecked();
      parentDiv = screen.getByText("Username:").closest("div");
      expect(within(parentDiv).getByRole("textbox")).toHaveValue(mockRemoteStore.user);
      parentDiv = screen.getByText("Password:").closest("div");
      expect(within(parentDiv).getByRole("password")).toHaveValue(`${mockRemoteStore.password}`);
      parentDiv = screen.getByText("Use Custom X.509 Configuration?").closest("div");
      expect(within(parentDiv).getByRole("checkbox")).toBeChecked();
      parentDiv = screen.getByText("Client Key Password:").closest("div");
      expect(within(parentDiv).getByRole("password")).toHaveValue(mockRemoteStore.key_password);
      expect(screen.getByText(mockRemoteStore.key_certificate_pem)).toHaveValue(`${mockRemoteStore.key_certificate_pem}`);
      expect(screen.getByText(mockRemoteStore.server_certificate_pem)).toHaveValue(`${mockRemoteStore.server_certificate_pem}`);
    });
  });
});
