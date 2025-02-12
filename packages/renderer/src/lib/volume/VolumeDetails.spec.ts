/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import VolumeDetails from './VolumeDetails.svelte';
import { get } from 'svelte/store';
import { volumeListInfos } from '/@/stores/volumes';
import type { VolumeListInfo } from '../../../../main/src/plugin/api/volume-info';

import { router } from 'tinro';
import { lastPage } from '/@/stores/breadcrumb';

const listVolumesMock = vi.fn();

const myVolume: VolumeListInfo = {
  engineId: 'engine0',
  engineName: 'podman',
  Volumes: [
    {
      Name: 'myVolume',
      engineId: 'engine0',
      engineName: 'podman',
      CreatedAt: undefined,
      containersUsage: undefined,
      Driver: undefined,
      Mountpoint: undefined,
      Labels: undefined,
      Scope: 'local',
      Options: undefined,
    },
  ],
  Warnings: undefined,
};

const removeVolumeMock = vi.fn();

beforeAll(() => {
  (window as any).listVolumes = listVolumesMock;
  (window as any).removeVolume = removeVolumeMock;
});

test('Expect redirect to previous page if volume is deleted', async () => {
  const routerGotoSpy = vi.spyOn(router, 'goto');
  listVolumesMock.mockResolvedValue([myVolume]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  while (get(volumeListInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // remove myVolume from the store when we call 'removeVolume'
  // it will then refresh the store and update VolumeDetails page
  removeVolumeMock.mockImplementation(() => {
    volumeListInfos.update(volumes => volumes.filter(volume => volume.engineId !== myVolume.engineId));
  });

  // defines a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // render the component
  render(VolumeDetails, { volumeName: 'myVolume', engineId: 'engine0' });

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/');

  // click on delete volume button
  const deleteButton = screen.getByRole('button', { name: 'Delete Volume' });
  await fireEvent.click(deleteButton);

  // check that remove method has been called
  expect(removeVolumeMock).toHaveBeenCalled();

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // grab updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});
