import { Log, RundownCached, RuntimeStore } from 'ontime-types';

import { isProduction, websocketUrl } from '../../externals';
import { CLIENT_LIST, CUSTOM_FIELDS, RUNDOWN, RUNTIME } from '../api/constants';
import { invalidateAllCaches } from '../api/utils';
import { ontimeQueryClient } from '../queryClient';
import {
  getClientId,
  getClientName,
  setClientId,
  setClientName,
  setClientRedirect,
  setClients,
} from '../stores/clientStore';
import { addDialog } from '../stores/dialogStore';
import { addLog } from '../stores/logger';
import { patchRuntime, runtimeStore } from '../stores/runtime';

export let websocket: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
const reconnectInterval = 1000;

export let shouldReconnect = true;
export let hasConnected = false;
export let reconnectAttempts = 0;

export const connectSocket = () => {
  websocket = new WebSocket(websocketUrl);

  const preferredClientName = getClientName();

  websocket.onopen = () => {
    clearTimeout(reconnectTimeout as NodeJS.Timeout);
    hasConnected = true;
    reconnectAttempts = 0;

    if (preferredClientName) {
      socketSendJson('set-client-name', preferredClientName);
    }

    socketSendJson('set-client-type', 'ontime');

    socketSendJson('set-client-path', location.pathname + location.search);
  };

  websocket.onclose = () => {
    console.warn('WebSocket disconnected');
    if (shouldReconnect) {
      reconnectTimeout = setTimeout(() => {
        console.warn('WebSocket: attempting reconnect');
        if (websocket && websocket.readyState === WebSocket.CLOSED) {
          reconnectAttempts += 1;
          connectSocket();
        }
      }, reconnectInterval);
    }
  };

  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  websocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      const { type, payload } = data;

      if (!type) {
        return;
      }

      switch (type) {
        case 'pong': {
          const offset = (new Date().getTime() - new Date(payload).getTime()) * 0.5;
          patchRuntime('ping', offset);
          updateDevTools({ ping: offset }, ['PING']);
          break;
        }
        case 'client-id': {
          if (typeof payload === 'string') {
            setClientId(payload);
          }
          break;
        }

        case 'client-name': {
          if (typeof payload === 'string') {
            setClientName(payload);
          }
          break;
        }

        case 'client-rename': {
          if (typeof payload === 'object') {
            const id = getClientId();
            if (payload.target && payload.target === id) {
              setClientName(payload.name);
            }
          }
          break;
        }

        case 'client-redirect': {
          if (typeof payload === 'object') {
            const id = getClientId();
            if (payload.target && payload.target === id) {
              setClientRedirect(payload.path);
            }
          }
          break;
        }

        case 'client-list': {
          setClients(payload);
          if (!isProduction) {
            ontimeQueryClient.setQueryData(CLIENT_LIST, payload);
          }
          break;
        }

        case 'dialog': {
          if (payload.dialog === 'welcome') {
            addDialog('welcome');
          }
          break;
        }

        case 'ontime-log': {
          addLog(payload as Log);
          break;
        }
        case 'ontime': {
          runtimeStore.setState(payload as RuntimeStore);
          if (!isProduction) {
            ontimeQueryClient.setQueryData(RUNTIME, data.payload);
          }
          break;
        }
        case 'ontime-clock': {
          patchRuntime('clock', payload);
          updateDevTools({ clock: payload });
          break;
        }
        case 'ontime-timer': {
          patchRuntime('timer', payload);
          updateDevTools({ timer: payload });
          break;
        }
        case 'ontime-onAir': {
          patchRuntime('onAir', payload);
          updateDevTools({ onAir: payload });
          break;
        }
        case 'ontime-message': {
          patchRuntime('message', payload);
          updateDevTools({ message: payload });
          break;
        }
        case 'ontime-runtime': {
          patchRuntime('runtime', payload);
          updateDevTools({ runtime: payload });
          break;
        }
        case 'ontime-eventNow': {
          patchRuntime('eventNow', payload);
          updateDevTools({ eventNow: payload });
          break;
        }
        case 'ontime-currentBlock': {
          patchRuntime('currentBlock', payload);
          updateDevTools({ currentBlock: payload });
          break;
        }
        case 'ontime-publicEventNow': {
          patchRuntime('publicEventNow', payload);
          updateDevTools({ publicEventNow: payload });
          break;
        }
        case 'ontime-eventNext': {
          patchRuntime('eventNext', payload);
          updateDevTools({ eventNext: payload });
          break;
        }
        case 'ontime-publicEventNext': {
          patchRuntime('publicEventNext', payload);
          updateDevTools({ publicEventNext: payload });
          break;
        }
        case 'ontime-auxtimer1': {
          patchRuntime('auxtimer1', payload);
          updateDevTools({ auxtimer1: payload });
          break;
        }
        case 'ontime-refetch': {
          // the refetch message signals that the rundown has changed in the server side
          const { revision, reload } = payload;
          const currentRevision = ontimeQueryClient.getQueryData<RundownCached>(RUNDOWN)?.revision ?? -1;

          if (reload) {
            invalidateAllCaches();
          } else if (revision > currentRevision) {
            ontimeQueryClient.invalidateQueries({ queryKey: RUNDOWN });
            ontimeQueryClient.invalidateQueries({ queryKey: CUSTOM_FIELDS });
          }
          break;
        }
      }
    } catch (_) {
      // ignore unhandled
    }
  };
};

export const disconnectSocket = () => {
  shouldReconnect = false;
  websocket?.close();
};

export const socketSend = (message: any) => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(message);
  }
};

export const socketSendJson = (type: string, payload?: unknown) => {
  socketSend(
    JSON.stringify({
      type,
      payload,
    }),
  );
};

function updateDevTools(newData: Partial<RuntimeStore>, store = RUNTIME) {
  if (!isProduction) {
    ontimeQueryClient.setQueryData(store, (oldData: RuntimeStore) => ({
      ...oldData,
      ...newData,
    }));
  }
}
