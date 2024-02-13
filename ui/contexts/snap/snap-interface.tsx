import {
  FormState,
  InterfaceState,
  UserInputEventType,
} from '@metamask/snaps-sdk';
import { debounce } from 'lodash';
import React, {
  FunctionComponent,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMemoizedInterface } from '../../selectors';
import { handleSnapRequest, updateInterfaceState } from '../../store/actions';
import { mergeValue } from './utils';

export type HandleEvent = (event: UserInputEventType, name?: string) => void;

export type HandleInputChange = (
  name: string,
  value: string,
  form?: string,
) => void;

export type GetValue = (name: string, form?: string) => string | undefined;

export type SnapInterfaceContextType = {
  handleEvent: HandleEvent;
  getValue: GetValue;
  handleInputChange: HandleInputChange;
};

export const SnapInterfaceContext =
  createContext<SnapInterfaceContextType | null>(null);

export type SnapInterfaceContextProviderProps = {
  children: ReactNode;
  interfaceId: string;
  snapId: string;
};

export const SnapInterfaceContextProvider: FunctionComponent<
  SnapInterfaceContextProviderProps
> = ({ children, interfaceId, snapId }) => {
  const dispatch = useDispatch();
  const { state: initialState } = useSelector(
    (state) => getMemoizedInterface(state, interfaceId),
    () => true,
  );

  const internalState = useRef<InterfaceState>(initialState ?? {});

  useEffect(() => {
    internalState.current = initialState;
  }, [initialState]);

  useEffect(() => {
    console.log('internal state triggered re-render');
  }, [internalState]);

  useEffect(() => {
    console.log('interface id triggered re-render');
  }, [interfaceId]);

  useEffect(() => {
    console.log('snapId triggered re-render');
  }, [snapId]);

  const snapRequestDebounced: HandleEvent = debounce(
    (event, name) =>
      handleSnapRequest({
        snapId,
        origin: '',
        handler: 'onUserInput',
        request: {
          jsonrpc: '2.0',
          method: ' ',
          params: {
            event: {
              type: event,
              name,
              value: internalState.current[name],
            },
            id: interfaceId,
          },
        },
      }),
    200,
  );

  const updateStateDebounced = debounce(
    (state) => dispatch(updateInterfaceState(interfaceId, state)),
    200,
  );

  const handleEvent: HandleEvent = (event, name) => {
    updateStateDebounced.flush();
    snapRequestDebounced(event, name);
  };

  const handleInputChange: HandleInputChange = (name, value, form) => {
    const state = mergeValue(internalState.current, name, value, form);

    internalState.current = state;
    updateStateDebounced(state);
  };

  const getValue: GetValue = (name, form) => {
    const value = form
      ? (initialState[form] as FormState)?.[name]
      : (initialState as FormState)?.[name];

    if (value) {
      return value;
    }

    return undefined;
  };

  return (
    <SnapInterfaceContext.Provider
      value={{ handleEvent, getValue, handleInputChange }}
    >
      {children}
    </SnapInterfaceContext.Provider>
  );
};

export function useSnapInterfaceContext() {
  return useContext(SnapInterfaceContext) as SnapInterfaceContextType;
}
