import React, { useMemo } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import QueryParser from "./QueryParser";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryParser />
      </ThemeProvider>
    </Router>
  );
}

export default App;
