import {
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { useMemo } from "react";
import type { FC } from "react";
import type { AvailableStockItem, PickingProductEntry } from "../types";
import { useGetUnitsOfMeasure } from "../../Stock/api";

interface ReviewListStepProps {
  items: PickingProductEntry[];
  stockMap: Map<number, AvailableStockItem>;
}

const ReviewListStep: FC<ReviewListStepProps> = ({ items, stockMap }) => {
  const validItems = items.filter((item) => item.product !== null);

  const { data: unitsData } = useGetUnitsOfMeasure();
  const unitsOfMeasure = useMemo(
    () => unitsData?.unitsOfMeasure ?? [],
    [unitsData?.unitsOfMeasure]
  );

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Review Picking List
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Available</TableCell>
              <TableCell>Unit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {validItems.map((item, index) => {
              const stock = item.product
                ? stockMap.get(item.product.id)
                : undefined;
              const isInsufficient =
                stock != null &&
                item.requestedQuantity > stock.availableQuantity;

              return (
                <TableRow key={item.product?.id ?? index}>
                  <TableCell>
                    {item.product?.name}
                    {isInsufficient && (
                      <WarningIcon
                        color="warning"
                        fontSize="small"
                        sx={{ ml: 0.5, verticalAlign: "middle" }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{item.product?.reference}</TableCell>
                  <TableCell align="right">{item.requestedQuantity}</TableCell>
                  <TableCell align="right">
                    {stock != null ? stock.availableQuantity : "—"}
                  </TableCell>
                  <TableCell>
                    {stock?.unitOfMeasureName ??
                      unitsOfMeasure.find(
                        (u) => u.id === item.product?.unitOfMeasureId
                      )?.name ??
                      ""}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" color="text.secondary" mt={2}>
        Total Products: {validItems.length}
      </Typography>

      {validItems.some(
        (item) =>
          item.product &&
          stockMap.get(item.product.id) != null &&
          item.requestedQuantity >
            (stockMap.get(item.product.id)?.availableQuantity ?? 0)
      ) && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Some products have insufficient stock. The picking list will be
          rejected if you proceed.
        </Alert>
      )}
    </>
  );
};

export default ReviewListStep;
