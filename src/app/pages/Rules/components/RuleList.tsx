import {
  Box,
  Button,
  Chip,
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
import type { RuleResponse } from "../types";
import { getRuleTypeLabel } from "../types";

interface RuleListProps {
  rules: RuleResponse[];
  isLoading: boolean;
  error: Error | null;
  onCreateNew: () => void;
  onEdit: (rule: RuleResponse) => void;
  onDelete: (rule: RuleResponse) => void;
}

const RuleList: FC<RuleListProps> = ({
  rules,
  isLoading,
  error,
  onCreateNew,
  onEdit,
  onDelete,
}) => {
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
        Failed to load rules. Please try again.
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
          Create New Rule
        </Button>
      </Box>

      {rules.length === 0 ? (
        <Alert severity="info">
          No placement rules configured yet. Create your first rule to enable
          automatic placement recommendations.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Products</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => (
                <TableRow
                  key={rule.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    onEdit(rule);
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {rule.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 250,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rule.description ?? "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>{getRuleTypeLabel(rule.type)}</TableCell>
                  <TableCell>
                    <Chip
                      label={rule.isActive ? "Active" : "Inactive"}
                      color={rule.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {rule.productIds ? String(rule.productIds.length) : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(rule);
                      }}
                      aria-label={`Delete ${rule.name}`}
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

export default RuleList;
