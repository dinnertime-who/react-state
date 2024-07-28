# @dinnertime/react-hooks

## useMounted

Component가 Mount되었을때 실행

- Promise 및 async function을 바로 사용 가능

```ts
useMounted: (executor: () => any | Promise<any>) => void;

// ex
useMounted(() => {
  console.log('Mounted');
})
```

## useUnmounted

Component가 Unmount되었을때 실행

- Promise 및 async function을 바로 사용 가능

```ts
const useUnmounted: (executor: () => any | Promise<any>) => void;

// ex
useUnmounted(() => {
  console.log('Unmounted');
});
```

## useDebounce

debounce로 동작하는 함수 정의

> Debounce는 특정 작업이 연속해서 호출될 때, 마지막 호출이 끝난 후 일정 시간이 지나기 전까지는 해당 작업을 수행하지 않도록 하는 기술입니다. 주로 입력 폼이나 스크롤 이벤트 처리 등에서 과도한 이벤트 호출을 방지하기 위해 사용됩니다. ( described by Chat Gpt )

```ts
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void;


// ex. 검색 컴포넌트
const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const debounceFetchResults = useDebounce((searchQuery: string) => {
    // 여기에 API 호출이나 검색 결과를 가져오는 로직을 추가하세요.
    console.log(`Fetching results for: ${searchQuery}`);
    setResults([searchQuery]); // 예제에서는 단순히 검색어를 결과로 설정
  }, 300);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debounceFetchResults(value);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search..."
      />
      <ul>
        {results.map((result, index) => (
          <li key={index}>{result}</li>
        ))}
      </ul>
    </div>
  );
};
```

## useThrottle

throttle 함수 정의

> Throttle은 특정 작업이 연속해서 호출될 때, 지정된 시간 간격 내에서는 해당 작업이 한 번만 수행되도록 하는 기술입니다. 주로 스크롤 이벤트나 창 크기 조정 이벤트 처리 등에서 과도한 이벤트 호출을 방지하기 위해 사용됩니다. ( described by Chat Gpt )

```ts
function useThrottle<T extends (...args: any[]) => void>(callback: T, delay: number): (...args: Parameters<T>) => void;

// ex 스크롤 이벤트 컴포넌트
const ScrollComponent = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const throttleHandleScroll = useThrottle(() => {
    const position = document.documentElement.scrollTop;
    console.log(position);
    setScrollPosition(position);
  }, 300);

  useEffect(() => {
    window.addEventListener('scroll', throttleHandleScroll);
    return () => {
      window.removeEventListener('scroll', throttleHandleScroll);
    };
  }, []);

  return (
    <div>
      <h1>Scroll down to see the throttle effect</h1>
      <p style={{ position: 'sticky', top: 0 }}>
        Scroll Position: {scrollPosition}
      </p>
      <div style={{ height: '2000px' }}>
        <p>Scroll to see the position update with throttling.</p>
      </div>
    </div>
  );
};
```

## useOnlineStatus

사용자의 기기의 네트워크 연결상태 확인 hook

```ts
function useOnlineStatus(): boolean;

// ex

const OnlineStatus = () => {
  const status = useOnlineStatus();

  useEffect(() => {
    alert(`Is Online: ${status}`);
  }, [status]);

  return null;
};
```
