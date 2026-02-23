import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { FC } from "react";
import type { ProductResponse, Category, UnitOfMeasure } from "../types";

interface ProductListProps {
  products: ProductResponse[];
  categories: Category[];
  unitsOfMeasure: UnitOfMeasure[];
  isLoading: boolean;
  error: Error | null;
  onCreateNew: () => void;
  onEdit: (product: ProductResponse) => void;
  onDelete: (product: ProductResponse) => void;
}

const ProductList: FC<ProductListProps> = ({
  products,
  categories,
  unitsOfMeasure,
  isLoading,
  error,
  onCreateNew,
  onEdit,
  onDelete,
}) => {
  const getCategoryName = (categoryId: number | null): string => {
    if (categoryId === null) return "—";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name ?? "—";
  };

  const getUnitName = (unitOfMeasureId: number): string => {
    const unit = unitsOfMeasure.find((u) => u.id === unitOfMeasureId);
    return unit?.abbreviation ?? "—";
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load products. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={onCreateNew}
        >
          Create New Product
        </Button>
      </Box>

      {products.length === 0 ? (
        <Alert severity="info">
          No products configured yet. Create your first product to start
          tracking inventory.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Min. Stock</TableCell>
                <TableCell>Rules</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    onEdit(product);
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {product.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {product.reference}
                    </Typography>
                  </TableCell>
                  <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                  <TableCell>{getUnitName(product.unitOfMeasureId)}</TableCell>
                  <TableCell>
                    {product.minimumStock !== null
                      ? String(product.minimumStock)
                      : "—"}
                  </TableCell>
                  <TableCell>{String(product.ruleIds.length)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(product);
                      }}
                      aria-label={`Delete ${product.name}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProductList;
