# @dinnertime/utils

### Updates

---

- 0.3.0

  - 유틸 타입 추가 ( Primitives, SerializablePrimitives, Serializable, SerializableObject )
  - UtilArray 추가
  - UtilArray.removeDuplicates 추가
  - UtilArray.isPrimitivesArray 추가

- 0.2.0
  - TypedPromise 추가
  - TypedPromise.allSettled추가

## Apis

### isWindowSafe

window 객체 유무 확인

```ts
function isWindowSafe(): boolean;
```

### isDocumentSafe

document 객체 유무 확인

```ts
function isDocumentSafe(): boolean;
```

\* isWindowSafe와 isDocumentSafe가 필요한 이유?

> Next.js를 이용하여 웹 애플리케이션을 개발하는 과정에서, 커스텀 훅(custom hook) 내에서 window 객체가 undefined로 나오는 문제가 종종 발생합니다. 이 문제는 주로 Next.js의 서버 사이드 렌더링(Server-Side Rendering, SSR) 특성 때문에 발생합니다. 그로인해 반복되는 코드(`typeof window === 'undefined` `typeof document === 'undefined'`)를 util로 만들었습니다.

### wait

비동기 기능 동작시 일정 시간동안 대기하기

```ts
function wait(ms: number): Promise<unknown>;
```

### isMobile

현재 사용자가 접속한 환경이 모바일 환경인지 아닌지 확인하는 함수

```ts
function isMobile(): boolean;
```

### getDocumentCookie

브라우저 쿠키를 이름으로 가져오기

```ts
function getDocumentCookie(name: string): string;
```

### safeDivide

숫자 나누기를 안전하게 처리하는 함수

- parseInt: true인 경우 결과 값을 int로 return

```ts
function safeDivide(
  a: number,
  b: number,
  {
    parseInt,
  }: {
    parseInt: boolean;
  },
): number;
```

### TypedPromise

Typescript 환경에서 Promise 객체를 사용할 때 불편한 부분을 개선

### TypedPromise.allSettled

> Promise.allSettled의 결과값을 받아와 성공한 Promise와 실패한 Promise를 filter 메서드를 통해 구분할 때, 각 요소가 여전히 PromiseSettledResult 타입으로 되어 있어 타입 가드나 타입 캐스팅을 해야 하는 문제를 해결하기 위해 작성되었습니다.

```ts
static allSettled<T extends readonly unknown[] | []>(promiseList: T): Promise<{
fullfiled: { [P in keyof T]: PromiseFulfilledResult<Awaited<T[P]>>; };
rejected: { [P in keyof T]: PromiseRejectedResult; };
settled: { -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>; };
}>;

// ex
(async () => {
  // readonly [Promise<number>, Promise<string>, Promise<boolean>]
  const testPromises = [
    Promise.resolve(0),
    Promise.resolve('test'),
    Promise.resolve(false)
  ] as const

  // [PromiseSettledResult<number>, PromiseSettledResult<string>, PromiseSettledResult<boolean>]
  const defaultSettled = await Promise.allSettled(testPromises);

  // (PromiseRejectedResult | PromiseFulfilledResult<number> | PromiseFulfilledResult<string> | PromiseFulfilledResult<boolean>)[]
  const defaultFulfilled = defaultSettled.filter(({status}) => status === 'fulfilled');
  // (PromiseRejectedResult | PromiseFulfilledResult<number> | PromiseFulfilledResult<string> | PromiseFulfilledResult<boolean>)[]
  const defaultRejected = defaultSettled.filter(({status}) => status === 'rejected')


  const {
    fullfiled, // readonly [PromiseFulfilledResult<number>, PromiseFulfilledResult<string>, PromiseFulfilledResult<boolean>]
    rejected, // readonly [PromiseRejectedResult, PromiseRejectedResult, PromiseRejectedResult]
    settled // [PromiseSettledResult<number>, PromiseSettledResult<string>, PromiseSettledResult<boolean>]
  } = await TypedPromise.allSettled(testPromises)
})()
```

### UtilArray

자주 사용되는 배열 기능을 정의

### UtilArray.removeDuplicates

> 배열 내의 중복을 제거, 원소들이 Object 형태인 경우 지정한 key들의 값을 기준으로 중복을 제거한다.

```ts
declare class UtilArray {
  static removeDuplicates<T extends Primitives[]>(array: T): T;
  static removeDuplicates<T extends SerializableObject[]>(
    array: T,
    keys: (keyof T[number])[],
  ): T;
}

// ex)
UtilArray.removeDuplicates(['1', 1, 2, false, false, 'test', 2]);
// => ['1', 1, 2, false, 'test']

UtilArray.removeDuplicates(
  [
    { id: 1, name: 'tester' },
    { id: 2, name: 'tester' },
    { id: 2, name: 'tester3' },
  ],
  ['id'],
);
// => [ { id: 1, name: 'tester' }, { id: 2, name: 'tester3' }]

UtilArray.removeDuplicates(
  [
    { id: 1, name: 'tester' },
    { id: 2, name: 'tester' },
    { id: 2, name: 'tester3' },
  ],
  ['name'],
);
// => [ { id: 2, name: 'tester2' }, { id: 2, name: 'tester3' }]

UtilArray.removeDuplicates(
  [
    { id: 1, name: 'tester' },
    { id: 2, name: 'tester' },
    { id: 2, name: 'tester3' },
  ],
  ['id', 'name'],
);
// => [ { id: 1, name: 'tester' }, { id: 2, name: 'tester2' }, { id: 2, name: 'tester3' }]
```
