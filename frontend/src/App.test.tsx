import { render } from "@testing-library/react";
import App from "./App";

test("renders calculator component", () => {
  const { container } = render(<App />);
  // The Calculator component renders a div with class "calculator"
  expect(container.querySelector(".calculator")).toBeInTheDocument();
});
