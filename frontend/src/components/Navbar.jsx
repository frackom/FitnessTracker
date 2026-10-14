import { Link, NavLink } from "react-router-dom";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";

function Navbar() {
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
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
          gap: 2,
          py: { xs: 2, md: 0 },
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
            fontWeight: 700,
          }}
        >
          FitnessTracker
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
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;