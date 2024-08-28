# @dinnertime/react-state

## Easy and simple React state management - 리액트 상태관리를 쉽고 간단하게

<br />
<br />

## Overview

Context Api를 State처럼 정의하고 사용할 수 있다

<br />
<br />

## Examples

### 1. useState 대체하기

```tsx
// before
export const Component = () => {
  const [count, setCount] = useState(0);

  const computedValue = useMemo(() => count * 2, [count]);

  useEffect(() =>{
    console.log(count);
  }, [count]);

  return <button onClick={() => setCount((prev) => prev++)}>
    Click {count} / {computedValue}
  </button>
}

// after
export const Component = () => {
  const CountSignal = createSignalState(0);
  const { value: count, dispatch, compute, effect } = useSignalState(CountSignal);

  const computedValue = compute((count) => count * 2);

  effect((count) => {
    console.log(count);
  });

  return <button onClick={() => dispatch((prev) => prev++)}>
    Click {count} / {computedValue}
  </button>
}
```

### 2. Context Api 대체하기

```tsx
// before
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

type CountContextType = {
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
};
const CountContext = createContext<CountContextType | null>(null);

const useCountContext = () => {
  const context = useContext(CountContext);
  if (!context) {
    throw new Error('Context Error');
  }
  return context;
};

const CountContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = useState(0);
  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  );
};

const ChildComponent = () => {
  const { count, setCount } = useCountContext();

  // ...
  return <>{count}</>;
};

const Component = () => {
  return (
    <CountContextProvider>
      <ChildComponent />
    </CountContextProvider>
  );
};



// after
const CountSignal = createSignalState(0);

const Component = () => {
  const { value: count, dispatch, compute, effect } = useSignalState(CountSignal);
  // ...
  return <>{count}</>;
};
```
