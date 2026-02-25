import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { FC } from "react";
import type { OnboardingProductEntry } from "../types";

interface OnboardingReviewStepProps {
  products: OnboardingProductEntry[];
}

const OnboardingReviewStep: FC<OnboardingReviewStepProps> = ({ products }) => {
  return (
    <>
      <Typography variant="subtitle1" color="text.primary" mb={2}>
        Review products
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Lot #</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell align="right">Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={`${String(product.productId)}-${String(index)}`}>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.productReference}</TableCell>
                <TableCell>
                  {product.manualLot ? product.lotReference : "Auto"}
                </TableCell>
                <TableCell>
                  {product.expiryDate
                    ? new Date(product.expiryDate).toLocaleDateString()
                    : "\u2014"}
                </TableCell>
                <TableCell align="right">
                  {product.quantity}
                  {product.unitOfMeasureName
                    ? ` ${product.unitOfMeasureName}`
                    : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="body2" color="text.secondary" mt={2}>
        Total: {products.length} product{products.length !== 1 ? "s" : ""}
      </Typography>
    </>
  );
};

export default OnboardingReviewStep;
