import App from "../app";

export function loadStage() {
  const app = new App();
  app.init();
  return app;
}