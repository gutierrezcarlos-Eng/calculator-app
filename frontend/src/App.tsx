import { Calculator } from "./components/Calculator";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

function App() {
  return (
    <div className="app">
      <ErrorBoundary>
        <Calculator />
      </ErrorBoundary>
    </div>
  );
}

export default App;
