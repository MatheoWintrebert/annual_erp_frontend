import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Button,
} from "@mui/material";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";

const SetupPage: React.FC = () => {
  const [companyName, setCompanyName] = React.useState("");
  const [logoUrl, setLogoUrl] = React.useState("");
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            color="text.primary"
            gutterBottom
            fontWeight={600}
            mt={4}
          >
            Setup Your Company
          </Typography>
          <Box
            component="form"
            sx={{
              mt: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: 400,
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // handle form submission here
              }}
            >
              <Stack spacing={2} direction="column" sx={{ marginBottom: 4 }}>
                <FormControl variant="standard">
                  <InputLabel htmlFor="companyName">Company Name</InputLabel>
                  <Input
                    autoFocus
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                  <FormHelperText>
                    Enter the name of your company.
                  </FormHelperText>
                </FormControl>
                <FormControl variant="standard">
                  <InputLabel htmlFor="logoUrl">Logo URL</InputLabel>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                  <FormHelperText>
                    Enter the URL of your company logo.
                  </FormHelperText>
                </FormControl>
              </Stack>
              <Box display="flex" justifyContent="center">
                <Button
                  type="submit"
                  color="info"
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 16,
                    paddingX: 3,
                    paddingY: 1,
                  }}
                >
                  Submit
                </Button>
              </Box>
            </form>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default SetupPage;
