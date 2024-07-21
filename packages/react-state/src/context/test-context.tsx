'use client';
import * as React from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';

const qc = new QueryClient();

const Context = React.createContext<{ hello: () => void } | null>(null);

export const useTestContext = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error('Error');
  }
  return context;
};

export const useTestQuery = () => {
  const queryResult = useQuery(
    {
      queryKey: ['test'],
      queryFn: () => 'test',
    },
    qc,
  );

  return queryResult;
};

export const TextContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  function hello() {
    console.log('hello');
  }

  return <Context.Provider value={{ hello }}>{children}</Context.Provider>;
};
