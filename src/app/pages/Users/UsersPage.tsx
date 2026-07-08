import { useState } from "react";
import type { FC } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import { useGetUsersQuery } from "@/services";
import { CreateUserDialog, UsersTable } from "./components";

const UsersPage: FC = () => {
  const { data: users = [], isPending, isError } = useGetUsersQuery();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1} py={4}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Typography variant="h3" fontWeight={600}>
              Users
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => {
                setDialogOpen(true);
              }}
            >
              Create user
            </Button>
          </Stack>

          {isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Could not load the users.
            </Alert>
          )}

          {isPending ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <UsersTable rows={users} />
          )}
        </Container>
      </Box>
      <Footer />

      <CreateUserDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
      />
    </Box>
  );
};

export default UsersPage;
