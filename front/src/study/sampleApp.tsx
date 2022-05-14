import React from "react";
import ReactDOM from "react-dom";

addEventListener("DOMContentLoaded", () => {
  main();
});

const main = () => {
  ReactDOM.render(<App />, document.querySelector("#root"));
};

const App = () => {
  return (
    <>
      <h1>Hello, World!</h1>
    </>
  );
};
