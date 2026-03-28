import React from "react";
import "./App.css";
import "react-quill/dist/quill.snow.css";
import theme from "./theme";
import { ThemeProvider } from "@emotion/react";
import RootRoutes from "./routes";
import { Amplify } from "aws-amplify";

import config from "./amplifyconfiguration.json";
import { Authenticator } from "@aws-amplify/ui-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Provider } from "react-redux";
import { store } from "./api/store/store";

Amplify.configure(config);

function App() {
  return (
    <Provider store={store}>
      <Authenticator.Provider>
        <ThemeProvider theme={theme}>
          <DndProvider backend={HTML5Backend}>
            <RootRoutes />
          </DndProvider>
        </ThemeProvider>
      </Authenticator.Provider>
    </Provider>
  );
}

export default App;
