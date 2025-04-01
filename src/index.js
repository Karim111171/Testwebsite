import React from "react";
import ReactDOM from "react-dom/client";  // Importer depuis react-dom/client
import App from "./App";  // Si ton fichier principal est App.js

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);  // Créer un root avec createRoot
  root.render(<App />);  // Utiliser .render() pour monter l'application
} else {
  console.error("Le conteneur root n'existe pas");
}
