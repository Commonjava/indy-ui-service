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
import {render, screen, cleanup} from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import {MemoryRouter} from 'react-router-dom';
import '@testing-library/jest-dom';
import NavHeader from "./NavHeader.jsx";

afterEach(() => {
  cleanup();
});

describe('Header tests', () => {
  it("Verify Header for elements existing", async ()=>{
    const user = userEvent.setup();
    render(<MemoryRouter><NavHeader /></MemoryRouter>);
    expect(screen.getByRole("link", {name: "Indy"})).toHaveAttribute("href", "/");
    const remoteReposButton = screen.getByRole("button", {name: "Remote Repositories"});
    expect(remoteReposButton).toBeInTheDocument();
    const hostedReposButton = screen.getByRole("button", {name: "Hosted Repositories"});
    expect(hostedReposButton).toBeInTheDocument();
    const groupsButton = screen.getByRole("button", {name: "Groups"});
    expect(groupsButton).toBeInTheDocument();
    expect(screen.getByRole("link", {name: "REST API"})).toHaveAttribute("href", "/q/swagger-ui");
    const addonsButton = screen.getByRole("button", {name: "More"});
    expect(addonsButton).toBeInTheDocument();
    // TODO: test the user login elements later when implemented

    await user.click(remoteReposButton);
    await user.click(hostedReposButton);
    await user.click(groupsButton);
    expect(screen.getAllByRole("link", {name: "maven"})).toHaveLength(3);
    expect(screen.getAllByRole("link", {name: "generic-http"})).toHaveLength(3);
    expect(screen.getAllByRole("link", {name: "npm"})).toHaveLength(3);

    await user.click(addonsButton);
    expect(screen.getByRole("link", {name: "Not-Found Cache"})).toBeInTheDocument();
    expect(screen.getByRole("link", {name: "Delete Cache"})).toBeInTheDocument();
  });
});
