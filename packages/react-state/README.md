# @dinnertime/react-state

> All English content below has been translated using Google Translator.

## Easy and simple React state management - 리액트 상태관리를 쉽고 간단하게

> 기존 React에서는 Context API를 사용하여 서로 다른 컴포넌트 간에 상태를 공유할 수 있습니다. 그러나 Context API는 보일러플레이트 코드가 많아져 코드 작성량이 증가하는 단점이 있습니다.
>
> 다른 상태 관리 라이브러리들도 존재하지만, 일반적으로 러닝 커브가 높아 초기 학습에 많은 시간을 필요로 합니다.
>
> 또한, HTTP 요청 결과를 상태 관리하려면 tanstack/react-query와 같은 별도의 라이브러리를 사용해야 합니다.
>
> 이러한 여러 문제점을 해결하고, 상태 관리를 더 간편하게 작업할 수 있도록 새로운 상태 관리 라이브러리를 개발했습니다. 이 라이브러리는 코드 작성량을 줄이고, 학습 곡선을 완화하며, 간단한 HTTP 요청 결과도 손쉽게 관리할 수 있는 통합된 솔루션을 제공합니다.

---

> In traditional React, the Context API is used to share state between different components. However, the Context API has the drawback of increasing the amount of code due to extensive boilerplate. While there are other state management libraries available, they typically have a steep learning curve, requiring significant time for initial learning.
>
> Additionally, managing HTTP request results necessitates the use of a separate library such as tanstack/react-query. To address these issues and simplify state management, we developed a new state management library. This library reduces the amount of code needed, eases the learning curve, and provides an integrated solution for easily managing simple HTTP request results.

<br />

## Overview

### 1. Create Context

- 목적에 맞는 Context를 생성합니다. ( Create a context that suits your purpose. )
  \*\* Context는 hook또는 Component 함수 내에 위치해서는 안됩니다. ( Context should not be located within a hook or component function.)

```ts
export type ThemeContextType = 'light' | 'dark' | 'system';

export const ThemeContext = createGlobalContext<ThemeContextType>('light');
```

### 2. Use Context

- 위에서 정의한 Context를 사용할 Component 함수 또는 hook 함수에서 가져와 사용합니다. (
  The Context defined above is imported and used from the component function or hook function that will be used. )

```ts
export const useThemeHook = () => {
  const {
    value, //
    dispatch, //
    effect, //
    compute, //
    isDispatching, //
  } = useSimpleContext(ThemeContext);
};
```

### 3. Create And Use Http Context

- Http Context를 생성합니다. ( Create Http Context.
  )

```ts
const HttpContext = createHttpContext(
  async (
    contexts, // ... 주입한 context 목록 (List of injected contexts)
  ) => {
    // ... Http 코드 작성 (Write HTTP code)
  },
  [
    // ... Context Dependency 주입 ( 주입한 Context의 값이 변경될 때마다 위 callback 함수가 재 실행된다. )
    // ... Context Dependency Injection (The above callback function is re-executed whenever the value of the injected Context changes.)
  ],
);
```

- 원하는 곳에서 Context를 불러옵니다. ( Load Context from wherever you want. )

```ts
export const useHttpContextHook = () => {
  const {
    value, //
    effect,
    compute,
    isFetching,
    refetch,
    invalidate,
  } = useHttpContext(HttpContext);
};
```

## ScopedContext vs GlobalContext

- ScopedContext

  - createSimpleContext로 생성
  - app에 mount된 component들 중에서 ScopedContext를 사용하는 component가 존재하지 않는 경우 값을 초기화 한다.

- GlobalContext
  - createGlobalContext로 생성
  - mount여부와 상관없이 항상 같은 값을 유지한다.

---

- ScopeContext

  - Created with createSimpleContext
  - If there is no component that uses ScopedContext among the components mounted in the app, the value is initialized.

- GlobalContext
  - Created with createGlobalContext
  - Always maintains the same value regardless of whether it is mounted or not.

## useMergedContext

서로 다른 여러 개의 Context를 조합하여 사용할 수 있다. (
Multiple different contexts can be used in combination. )

```ts
const {
  effect, //
  compute, //
  isDispatching, //
} = useMergedContext(
  context1,
  context2,
  // ... contexts
);
```
