<script lang="ts">
import { faSignal } from '@fortawesome/free-solid-svg-icons';
import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import Button from '../ui/Button.svelte';

import ErrorMessage from '../ui/ErrorMessage.svelte';

export let providerContainerEngine: ProviderContainerConnectionInfo;

let listContainersResult = '';
let listInProgress = false;
let listError = '';

async function grabContainers() {
  const start = performance.now();
  listInProgress = true;
  listError = '';
  listContainersResult = '...Waiting for response...';
  try {
    const result = await window.listContainersFromEngine(providerContainerEngine);
    listContainersResult = `Responded: ${result.length} containers`;
  } catch (e) {
    listError = e;
    listContainersResult = 'Failed';
  } finally {
    listInProgress = false;
  }
  const end = performance.now();
  listContainersResult += ` (${(end - start).toFixed(2)}ms)`;
}
</script>

<div class="flex flex-row items-center">
  <div class="w-36">
    <Button
      bind:inProgress="{listInProgress}"
      class="my-1 w-full"
      on:click="{() => grabContainers()}"
      icon="{faSignal}">
      Check containers
    </Button>
  </div>
  <div role="status" class="mx-2">{listContainersResult}</div>
  {#if listError}
    <ErrorMessage class="mx-2" error="{listError}" />
  {/if}
</div>
