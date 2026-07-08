import { useState } from "react";
import type { FC } from "react";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteUserMutation } from "@/services";
import { CustomLoadingButton } from "@/components/CustomLoadingButton/CustomLoadingButton";
import type { ShortUser } from "@/services/auth/type";

interface UsersTableProps {
  rows: ShortUser[];
}

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const fullName = (user: ShortUser): string => {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name.length > 0 ? name : "—";
};

export const UsersTable: FC<UsersTableProps> = ({ rows }) => {
  const [deleteUser, { isLoading }] = useDeleteUserMutation();
  const [userToDelete, setUserToDelete] = useState<ShortUser | null>(null);

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    void deleteUser(userToDelete.id)
      .unwrap()
      .then(() => {
        setUserToDelete(null);
      });
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((user) => (
              <TableRow hover key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{fullName(user)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={user.isActive ? "Active" : "Inactive"}
                    color={user.isActive ? "success" : "default"}
                    variant={user.isActive ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Delete user">
                    <IconButton
                      color="error"
                      onClick={() => {
                        setUserToDelete(user);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!userToDelete}
        onClose={() => {
          if (!isLoading) setUserToDelete(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete user</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            {userToDelete ? userToDelete.email : "this user"}? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setUserToDelete(null);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <CustomLoadingButton
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            loading={isLoading}
          >
            Delete
          </CustomLoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
