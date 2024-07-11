import { useSimpleState } from "./lib";

function App() {
  const { value, set } = useSimpleState({ name: "hey", count: 0 });

  return (
    <>
      <div></div>
      <h1>Vite + React</h1>
      <div className="card">
        <button
          onClick={() =>
            set(
              async (prev) =>
                new Promise((resolve) =>
                  setTimeout(
                    () => resolve({ ...prev, count: prev.count + 1 }),
                    1000
                  )
                )
            )
          }
        >
          count is {value.name} / {value.count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
