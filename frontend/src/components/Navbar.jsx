import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Alert, AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (isLoggingOut) return;

    setError("");
    setIsLoggingOut(true);

    try {
      await signOut();
    } catch {
      setError("Could not log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        backgroundImage: "none",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          width: "100%",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: "minmax(0, 1fr) auto minmax(0, 1fr)",
          },
          gap: 2,
          py: 2,
        }}
      >
        <Typography
          component={Link}
          to="/"
          variant="h6"
          sx={{
            justifySelf: "start",
            color: "text.primary",
            textDecoration: "none",
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          Fitness
          <Box component="span" sx={{ color: "primary.main" }}>
            Tracker
          </Box>
        </Typography>

        <Box
          component="nav"
          aria-label="Main navigation"
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: { xs: 1, md: 2 },
          }}
        >
          {[
            { to: "/workouts", label: "Workout History" },
            { to: "/routines", label: "My Routines" },
            { to: "/progress", label: "Track Progress" },
          ].map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                px: 2,
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  bgcolor: "action.hover",
                },
                "&.active": {
                  color: "primary.main",
                  bgcolor: "action.selected",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", lg: "flex-end" },
            gap: 2,
            minWidth: 0,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            title={user?.email}
            sx={{
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.email}
          </Typography>

          <Button
            variant="outlined"
            onClick={handleLogout}
            disabled={isLoggingOut}
            sx={{ flexShrink: 0 }}
          >
            {isLoggingOut ? "Logging out…" : "Log out"}
          </Button>
        </Box>
      </Toolbar>

      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
    </AppBar>
  );
}

export default Navbar;