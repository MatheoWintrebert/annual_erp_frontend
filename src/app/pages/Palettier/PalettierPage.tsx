import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Header from "../../components/ui/Header.tsx";
import Footer from "../../components/ui/Footer.tsx";
import NumberSpinner from "../../components/NumberSpinner.tsx";

interface PalettierFormData {
  name: string;
  type: string;
  dimensionX: number;
  dimensionY: number;
  dimensionZ: number;
}

interface FormData {
  palettierCount: number;
  palettiers: PalettierFormData[];
}

const PALETTIER_TYPES = [
  "Client",
  "Company",
  "Other",
  "Refrigerated",
  "Dangerous",
  "Chemical",
] as const;

const PalettierPage: React.FC = () => {
  const [palettierCount, setPalettierCount] = React.useState(1);

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (
      !allowedKeys.includes(e.key) &&
      (e.key < "0" || e.key > "9") &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      palettierCount: 1,
      palettiers: [
        {
          name: "",
          type: PALETTIER_TYPES[0],
          dimensionX: 1,
          dimensionY: 1,
          dimensionZ: 1,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "palettiers",
  });

  const handleCountChange = (newCount: number) => {
    setPalettierCount(newCount);
    const currentCount = fields.length;

    if (newCount > currentCount) {
      for (let i = currentCount; i < newCount; i++) {
        append({
          name: "",
          type: PALETTIER_TYPES[0],
          dimensionX: 1,
          dimensionY: 1,
          dimensionZ: 1,
        });
      }
    } else if (newCount < currentCount) {
      for (let i = currentCount - 1; i >= newCount; i--) {
        remove(i);
      }
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

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
            Configuration des palettiers
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ marginBottom: 4, marginTop: 3 }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h6" color="text.secondary" mb={2}>
                  Nombre de palettiers
                </Typography>
                <NumberSpinner
                  value={palettierCount}
                  onChange={handleCountChange}
                  min={1}
                  label="Nombre de palettiers"
                />
              </Box>

              <Divider />

              {fields.map((field, index) => (
                <Paper
                  key={field.id}
                  elevation={2}
                  sx={{ padding: 3, backgroundColor: "background.paper" }}
                >
                  <Typography variant="h6" color="text.primary" mb={2}>
                    Palettier {index + 1}
                  </Typography>

                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <Controller
                        name={`palettiers.${index}.name`}
                        control={control}
                        rules={{ required: "Le nom est requis" }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Nom du palettier"
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />

                      <Controller
                        name={`palettiers.${index}.type`}
                        control={control}
                        rules={{ required: "Le type est requis" }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            select
                            label="Type de palettier"
                            fullWidth
                            error={!!error}
                            helperText={error?.message}
                          >
                            {PALETTIER_TYPES.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Stack>

                    <Box>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        mb={1}
                      >
                        Dimensions
                      </Typography>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                      >
                        <Controller
                          name={`palettiers.${index}.dimensionX`}
                          control={control}
                          rules={{
                            required: "La dimension X est requise",
                            min: { value: 1, message: "Minimum 1" },
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              type="number"
                              label="Largeur (X)"
                              fullWidth
                              onKeyDown={handleNumericKeyDown}
                              slotProps={{
                                htmlInput: { min: 1 },
                              }}
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />

                        <Controller
                          name={`palettiers.${index}.dimensionY`}
                          control={control}
                          rules={{
                            required: "La dimension Y est requise",
                            min: { value: 1, message: "Minimum 1" },
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              type="number"
                              label="Profondeur (Y)"
                              fullWidth
                              onKeyDown={handleNumericKeyDown}
                              slotProps={{
                                htmlInput: { min: 1 },
                              }}
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />

                        <Controller
                          name={`palettiers.${index}.dimensionZ`}
                          control={control}
                          rules={{
                            required: "La dimension Z est requise",
                            min: { value: 1, message: "Minimum 1" },
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              type="number"
                              label="Hauteur (Z)"
                              fullWidth
                              onKeyDown={handleNumericKeyDown}
                              slotProps={{
                                htmlInput: { min: 1 },
                              }}
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              ))}

              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Valider la configuration
                </Button>
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default PalettierPage;
