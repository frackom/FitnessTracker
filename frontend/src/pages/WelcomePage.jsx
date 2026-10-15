import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/authApi";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

function WelcomePage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setSuccess("");

    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await register(email.trim(), password);

        setIsRegistering(false);
        setPassword("");
        setConfirmPassword("");
        setSuccess(
          "Account created. Log in with your email and password."
        );
      } else {
        await signIn(email.trim(), password);
        navigate("/routines", { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot reach the backend. Check that it is running and HTTPS is trusted."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode() {
    setIsRegistering((current) => !current);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  }


  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        bgcolor: "background.default",
        color: "text.primary",
        position: "relative",
        overflow: "hidden",
        backgroundImage:
          "radial-gradient(ellipse at 15% 20%, rgba(162,167,255,0.13), transparent 55%)",
      }}
    >
    <Box
    component="header"
    sx={{
        width: "100%",
        px: { xs: 3, md: 4 },
        py: 3,
    }}
    >
    <Typography
        variant="h6"
        sx={{
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: "text.primary",
        }}
    >
        Fitness
        <Box component="span" sx={{ color: "primary.main" }}>
        Tracker
        </Box>
    </Typography>
    </Box>
      <Container
        component="main"
        maxWidth="lg"
        sx={{ py: { xs: 6, md: 12 } }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.2fr 1fr",
            },
            alignItems: "center",
            gap: { xs: 6, md: 10 },
          }}
        >
          <Box>
            <Chip
              label="BUILD STRENGTH. SEE PROGRESS."
              variant="outlined"
              sx={{
                mb: 3,
                color: "primary.main",
                borderColor: "divider",
                fontSize: "0.7rem",
                letterSpacing: 1.5,
              }}
            />

            <Typography
              component="h1"
              sx={{
                fontSize: {
                  xs: "3rem",
                  sm: "4rem",
                  md: "4.8rem",
                },
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.05em",
                mb: 3,
              }}
            >
              Your training.
              <Box
                component="span"
                sx={{ display: "block", color: "primary.main" }}
              >
                Your progress.
              </Box>
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: "1.1rem",
                lineHeight: 1.8,
                maxWidth: 440,
                mb: 4,
              }}
            >
              Build your routines, record every set, and see how far
              you’ve come. Keep your strength training in one place.
            </Typography>

            <Stack spacing={2}>
              {[
                ["01", "Plan your sessions", "Create routines that fit your goals."],
                ["02", "Log your training", "Record the reps and weight you perform."],
                ["03", "See your progress", "Follow your performance over time."],
              ].map(([number, title, description]) => (
                <Stack
                  key={number}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      color: "primary.main",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  >
                    {number}
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Card
            variant="outlined"
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              position: "relative",
              boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                bgcolor: "primary.main",
              },
            }}
          >
            <Typography
              variant="overline"
              color="primary.main"
              sx={{ letterSpacing: 2 }}
            >
              FITNESS TRACKER
            </Typography>

            <Typography
              component="h2"
              variant="h4"
              sx={{ mt: 1, mb: 1.5 }}
            >
              {isRegistering ? "Start your journey." : "Welcome back."}
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 4 }}>
              {isRegistering
                ? "Create an account to plan and track your training."
                : "Log in to continue your training."}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  disabled={isSubmitting}
                  required
                  fullWidth
                />

                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={
                    isRegistering ? "new-password" : "current-password"
                  }
                  helperText={
                    isRegistering
                      ? "Use 8–128 characters, including uppercase, lowercase, a number and a symbol."
                      : undefined
                  }
                  slotProps={{
                    htmlInput: {
                      minLength: isRegistering ? 8 : undefined,
                      maxLength: 128,
                    },
                  }}
                  disabled={isSubmitting}
                  required
                  fullWidth
                />

                {isRegistering && (
                  <TextField
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    slotProps={{
                      htmlInput: { minLength: 8, maxLength: 128 },
                    }}
                    disabled={isSubmitting}
                    required
                    fullWidth
                  />
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ py: 1.5 }}
                >
                  {isSubmitting
                    ? "Please wait…"
                    : isRegistering
                      ? "Create account"
                      : "Log in →"}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              {isRegistering
                ? "Already have an account?"
                : "Don't have an account?"}
            </Typography>

            <Button
              type="button"
              onClick={toggleMode}
              disabled={isSubmitting}
              fullWidth
              sx={{ mt: 1 }}
            >
              {isRegistering ? "Log in" : "Create an account"}
            </Button>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

export default WelcomePage;