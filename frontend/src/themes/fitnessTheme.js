import { createTheme } from "@mui/material/styles";

const fitnessTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#a2a7ff", contrastText: "#171827" },
    background: { default: "#14151b", paper: "#1c1d24" },
    text: { primary: "#f4f5fa", secondary: "#b1b4c2" },
    divider: "#353742",
  },
  typography: {
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});

export default fitnessTheme;
