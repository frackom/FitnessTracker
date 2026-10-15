import {
  Alert, Button, Dialog,
  DialogActions, DialogContent,
  DialogContentText, DialogTitle,
} from "@mui/material";
import { useId } from "react";

function DeleteDialog({
  open,
  title = "Delete item?",
  message,
  isDeleting = false,
  error = "",
  onClose,
  onConfirm,
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText id={descriptionId}>
          {message}
        </DialogContentText>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button disabled={isDeleting} onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          disabled={isDeleting}
          onClick={onConfirm}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteDialog;