import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import type { FC, ReactNode } from "react";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import NumberSpinner from "../../components/NumberSpinner";
import { PalettierFormCard } from "./components";
import type { PalettierType, FormData, CreatePalettierPayload } from "./types";
import { createDefaultPalettier } from "./types";

const API_BASE_URL = "http://localhost:3333";

const PalettierPage: FC = () => {
  const [palettierCount, setPalettierCount] = useState(1);
  const [palettierTypes, setPalettierTypes] = useState<PalettierType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getDefaultTypeId = useCallback((): number | "" => {
    return palettierTypes.length > 0 ? palettierTypes[0].id : "";
  }, [palettierTypes]);

  const { control, handleSubmit, setValue, reset, getValues } =
    useForm<FormData>({
      defaultValues: {
        palettiers: [createDefaultPalettier("")],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "palettiers",
  });

  const fetchPalettierTypes = useCallback(async (): Promise<void> => {
    try {
      setIsLoadingTypes(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/palettier-types`);

      if (!response.ok) {
        throw new Error("Échec du chargement des types de palettiers");
      }

      const types = (await response.json()) as PalettierType[];
      setPalettierTypes(types);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setIsLoadingTypes(false);
    }
  }, []);

  useEffect(() => {
    void fetchPalettierTypes();
  }, [fetchPalettierTypes]);

  useEffect(() => {
    if (palettierTypes.length > 0) {
      reset({
        palettiers: [createDefaultPalettier(palettierTypes[0].id)],
      });
    }
  }, [palettierTypes, reset]);

  const handleCountChange = (newCount: number): void => {
    setPalettierCount(newCount);
    const currentCount = fields.length;
    const defaultTypeId = getDefaultTypeId();

    if (newCount > currentCount) {
      const pallettiersToAdd = Array.from(
        { length: newCount - currentCount },
        () => createDefaultPalettier(defaultTypeId)
      );
      pallettiersToAdd.forEach((p) => {
        append(p);
      });
    } else if (newCount < currentCount) {
      for (let i = currentCount - 1; i >= newCount; i--) {
        remove(i);
      }
    }
  };

  const createPalettierType = async (
    name: string
  ): Promise<PalettierType | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/palettier-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: "" }),
      });

      if (!response.ok) {
        throw new Error("Échec de la création du type");
      }

      const newType = (await response.json()) as PalettierType;
      setPalettierTypes((prev) => [...prev, newType]);
      return newType;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la création du type";
      setError(message);
      return null;
    }
  };

  const handleAddNewType = async (index: number): Promise<void> => {
    const formValues = getValues();
    const newTypeName = formValues.palettiers[index]?.newTypeName ?? "";

    if (!newTypeName.trim()) {
      return;
    }

    const trimmedName = newTypeName.trim();
    const existingType = palettierTypes.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
    );

    const idx = String(index);
    const typeIdPath = `palettiers.${idx}.typeId` as FieldPath<FormData>;
    const isNewTypePath = `palettiers.${idx}.isNewType` as FieldPath<FormData>;
    const newTypeNamePath =
      `palettiers.${idx}.newTypeName` as FieldPath<FormData>;

    if (existingType) {
      setValue(typeIdPath, existingType.id as never);
      setValue(isNewTypePath, false as never);
      setValue(newTypeNamePath, "" as never);
      return;
    }

    const newType = await createPalettierType(trimmedName);

    if (newType) {
      setValue(typeIdPath, newType.id as never);
      setValue(isNewTypePath, false as never);
      setValue(newTypeNamePath, "" as never);
    }
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      setError(null);

      const pallettiersPayload: CreatePalettierPayload[] = data.palettiers.map(
        (palettier) => ({
          name: palettier.name,
          typeId: palettier.typeId as number,
          width: palettier.width,
          depth: palettier.depth,
          height: palettier.height,
        })
      );

      const response = await fetch(`${API_BASE_URL}/palettiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ palettiers: pallettiersPayload }),
      });

      if (!response.ok) {
        throw new Error("Échec de l'enregistrement des palettiers");
      }

      setSuccessMessage("Palettiers enregistrés avec succès");
      setPalettierCount(1);
      reset({
        palettiers: [createDefaultPalettier(getDefaultTypeId())],
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = (): void => {
    setSuccessMessage(null);
  };

  const handleCloseError = (): void => {
    setError(null);
  };

  const renderLoadingState = (): ReactNode => (
    <Box display="flex" justifyContent="center" py={4}>
      <CircularProgress color="secondary" />
    </Box>
  );

  const renderErrorState = (): ReactNode => (
    <Alert
      severity="error"
      action={
        <Button
          color="inherit"
          size="small"
          onClick={() => void fetchPalettierTypes()}
        >
          Réessayer
        </Button>
      }
    >
      {error}
    </Alert>
  );

  const renderForm = (): ReactNode => (
    <Box
      component="form"
      onSubmit={(e) => {
        void handleSubmit(onSubmit)(e);
      }}
    >
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

        {palettierTypes.length === 0 && (
          <Alert severity="info">
            Aucun type de palettier n'existe encore. Utilisez l'option "Nouveau"
            ci-dessous pour créer votre premier type.
          </Alert>
        )}

        {fields.map((field, index) => (
          <PalettierFormCard
            key={field.id}
            index={index}
            control={control}
            setValue={setValue}
            palettierTypes={palettierTypes}
            onAddNewType={handleAddNewType}
          />
        ))}

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Valider la configuration"
            )}
          </Button>
        </Box>
      </Stack>
    </Box>
  );

  const hasLoadedWithoutError = !isLoadingTypes && !error;
  const hasErrorWithNoTypes =
    !isLoadingTypes && error && palettierTypes.length === 0;

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

          {isLoadingTypes && renderLoadingState()}
          {hasErrorWithNoTypes && renderErrorState()}
          {hasLoadedWithoutError && renderForm()}
        </Container>
      </Box>
      <Footer />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error && palettierTypes.length > 0}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PalettierPage;
