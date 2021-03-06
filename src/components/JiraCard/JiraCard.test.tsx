/*
 * Copyright 2020 RoadieHQ
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ApiRegistry, ApiProvider, UrlPatternDiscovery } from '@backstage/core';
import { rest } from 'msw';
import { msw } from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { JiraAPI, jiraApiRef } from '../../api';
import { JiraCard } from './JiraCard';
import {
  activityResponseStub,
  entityStub,
  projectResponseStub,
  searchResponseStub,
  statusesResponseStub,
} from '../../responseStubs';

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');

const apis = ApiRegistry.from([[jiraApiRef, new JiraAPI({ discoveryApi })]]);

describe('JiraCard', () => {
  const worker = setupServer();
  msw.setupDefaultHandlers(worker);

  beforeEach(() => {
    jest.resetAllMocks();
    worker.use(
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/project/BT',
        (_, res, ctx) => res(ctx.json(projectResponseStub)),
      ),
      rest.post(
        'http://exampleapi.com/jira/api/rest/api/latest/search',
        (_, res, ctx) => res(ctx.json(searchResponseStub)),
      ),
      rest.get(
        'http://exampleapi.com/jira/api/rest/api/latest/project/BT/statuses',
        (_, res, ctx) => res(ctx.json(statusesResponseStub)),
      ),
      rest.get('http://exampleapi.com/jira/api/activity', (_, res, ctx) =>
        res(ctx.xml(activityResponseStub)),
      ),
    );
  });

  it('should display board and component data', async () => {
    const rendered = render(
      <MemoryRouter>
        <ApiProvider apis={apis}>
          <JiraCard entity={entityStub} />
        </ApiProvider>
      </MemoryRouter>,
    );
    expect(await rendered.findByText(/backstage-test/)).toBeInTheDocument();
    expect(await rendered.findByText(/testComponent/)).toBeInTheDocument();
  });
});
