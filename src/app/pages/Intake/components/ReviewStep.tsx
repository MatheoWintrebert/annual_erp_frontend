import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { FC } from "react";
import { getUnitName } from "../types";
import type { IntakeFormData, ProductOption, UnitOfMeasure } from "../types";

interface ReviewStepProps {
  values: IntakeFormData;
  products: ProductOption[];
  unitsOfMeasure: UnitOfMeasure[];
}

const ReviewStep: FC<ReviewStepProps> = ({
  values,
  products,
  unitsOfMeasure,
}) => (
  <Stack spacing={2}>
    <Typography variant="h6" color="text.primary">
      Review Intake Details
    </Typography>

    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Lot</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Unit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {values.items.map((item, index) => {
            const product = products.find((p) => p.id === item.productId);
            const unitName = getUnitName(
              item.productId,
              products,
              unitsOfMeasure
            );

            return (
              <TableRow key={`${String(item.productId)}-${String(index)}`}>
                <TableCell>
                  {product ? `${product.reference} — ${product.name}` : "—"}
                </TableCell>
                <TableCell>
                  {item.isManualLot && item.lotReference !== ""
                    ? item.lotReference
                    : "Auto-generated"}
                </TableCell>
                <TableCell>
                  {item.expiryDate !== "" ? item.expiryDate : "—"}
                </TableCell>
                <TableCell>
                  {item.quantity !== "" ? String(item.quantity) : "—"}
                </TableCell>
                <TableCell>{unitName !== "" ? unitName : "—"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>

    <Typography variant="body2" color="text.secondary">
      Total Products: {values.items.length}
    </Typography>
  </Stack>
);

export default ReviewStep;
