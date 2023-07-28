import React from "react";
import TableComponent from "./components/tableComponent/tableComponent";
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Таблица с данными</h1>
      <TableComponent />
    </div>
  );
};

export default App;
