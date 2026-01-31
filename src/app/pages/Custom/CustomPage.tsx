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
  Card,
} from "@mui/material";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";

const CustomPage: React.FC = () => {
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
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
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
            </Box>
            <Card
              variant="outlined"
              sx={{
                marginLeft: "auto",
                padding: 3,
                maxWidth: 400,
                alignSelf: "center",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                fontWeight={600}
                align="center"
              >
                Need Help with Setup?
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Optional integration support is available directly from the web
                app. Since each company uses different data formats, we can
                develop a custom integration to connect your existing systems,
                automate barcode transfers, and fully configure the pallet
                storage tool. This service ensures a reliable setup tailored to
                your operational data and workflows. <br />
                Contact us to learn more about it.
              </Typography>
            </Card>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default CustomPage;
