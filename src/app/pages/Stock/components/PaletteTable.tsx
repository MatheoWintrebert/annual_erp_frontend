import { useMemo, useState } from "react";
import {
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Tooltip,
} from "@mui/material";
import { Delete, Edit, MoreVert, WarningAmber } from "@mui/icons-material";
import PlaceIcon from "@mui/icons-material/Place";
import type { FC } from "react";
import type {
	EditPaletteData,
	PaletteTableRow,
	RuleViolation,
	SortField,
	SortDirection,
} from "../types";
import { formatPosition } from "../types";
import PositionEditDialog from "./PositionEditDialog";
import PaletteLocatorDialog from "../../Picking/components/PaletteLocatorDialog";
import ViolationAlertDialog from "../../../components/ViolationAlertDialog";

interface LocatorTarget {
	palettierName: string;
	positionX: number;
	positionY: number;
	positionZ: number;
	productName: string;
}
import { useDeletePalette } from "../api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { useApiError } from "../../../hooks/useApiError";

interface PaletteTableProps {
	rows: PaletteTableRow[];
	violationsMap?: Map<number, RuleViolation[]>;
}

function compareRows(
	a: PaletteTableRow,
	b: PaletteTableRow,
	field: SortField,
	direction: SortDirection,
): number {
	const multiplier = direction === "asc" ? 1 : -1;

	const valA = a[field];
	const valB = b[field];

	if (valA === null && valB === null) return 0;
	if (valA === null) return 1;
	if (valB === null) return -1;

	if (valA < valB) return -1 * multiplier;
	if (valA > valB) return 1 * multiplier;
	return 0;
}

const SortableHeader: FC<{
	label: string;
	field: SortField;
	activeField: SortField;
	direction: SortDirection;
	onSort: (field: SortField) => void;
}> = ({ label, field, activeField, direction, onSort }) => (
	<TableCell>
		<TableSortLabel
			active={activeField === field}
			direction={activeField === field ? direction : "asc"}
			onClick={() => {
				onSort(field);
			}}
		>
			{label}
		</TableSortLabel>
	</TableCell>
);

const PaletteTable: FC<PaletteTableProps> = ({ rows, violationsMap }) => {
	const [sortField, setSortField] = useState<SortField>("receivedAt");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [editPalette, setEditPalette] = useState<EditPaletteData | null>(null);
	const [locatorTarget, setLocatorTarget] = useState<LocatorTarget | null>(
		null,
	);
	const [viewViolationsPaletteId, setViewViolationsPaletteId] = useState<
		number | null
	>(null);
	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
	const [menuRow, setMenuRow] = useState<PaletteTableRow | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

	const { showSnackbar } = useSnackbar();
	const { handleError } = useApiError();
	const deleteMutation = useDeletePalette();

	const handleSort = (field: SortField) => {
		if (field === sortField) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	const handleMenuOpen = (
		event: React.MouseEvent<HTMLElement>,
		row: PaletteTableRow,
	) => {
		setMenuAnchor(event.currentTarget);
		setMenuRow(row);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
		setMenuRow(null);
	};

	const handleModify = () => {
		if (!menuRow) return;
		setEditPalette({
			paletteId: menuRow.paletteId,
			palettierName: menuRow.palettierName,
			palettierId: menuRow.palettierId,
			positionX: menuRow.positionX,
			positionY: menuRow.positionY,
			positionZ: menuRow.positionZ,
		});
		handleMenuClose();
	};

	const handleRemoveClick = () => {
		if (!menuRow) return;
		setConfirmDeleteId(menuRow.paletteId);
		handleMenuClose();
	};

	const handleConfirmDelete = async () => {
		if (confirmDeleteId === null) return;
		try {
			await deleteMutation.mutateAsync(confirmDeleteId);
			showSnackbar("Palette removed", "success");
		} catch (err) {
			void handleError(err);
		} finally {
			setConfirmDeleteId(null);
		}
	};

	const sortedRows = useMemo(
		() => [...rows].sort((a, b) => compareRows(a, b, sortField, sortDirection)),
		[rows, sortField, sortDirection],
	);

	const firstPaletteRowIndices = useMemo(() => {
		const seen = new Set<number>();
		const indices = new Set<number>();
		sortedRows.forEach((row, index) => {
			if (!seen.has(row.paletteId)) {
				seen.add(row.paletteId);
				indices.add(index);
			}
		});
		return indices;
	}, [sortedRows]);

	return (
		<>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<SortableHeader
								label="Palettier"
								field="palettierName"
								activeField={sortField}
								direction={sortDirection}
								onSort={handleSort}
							/>
							<TableCell>Position</TableCell>
							<SortableHeader
								label="Product"
								field="productName"
								activeField={sortField}
								direction={sortDirection}
								onSort={handleSort}
							/>
							<TableCell>Ref</TableCell>
							<TableCell>Qty</TableCell>
							<TableCell>Lot #</TableCell>
							<SortableHeader
								label="Expiry"
								field="expiryDate"
								activeField={sortField}
								direction={sortDirection}
								onSort={handleSort}
							/>
							<SortableHeader
								label="Received"
								field="receivedAt"
								activeField={sortField}
								direction={sortDirection}
								onSort={handleSort}
							/>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{sortedRows.map((row, index) => {
							const isFirstForPalette = firstPaletteRowIndices.has(index);

							return (
								<TableRow
									key={`${String(row.paletteId)}-${row.lotReference || "empty"}`}
									hover
								>
									<TableCell>{row.palettierName}</TableCell>
									<TableCell>
										{formatPosition(
											row.positionX,
											row.positionY,
											row.positionZ,
										)}
									</TableCell>
									<TableCell>{row.productName || "—"}</TableCell>
									<TableCell>{row.productReference || "—"}</TableCell>
									<TableCell>
										{row.unitOfMeasureName
											? `${String(row.quantity)} ${row.unitOfMeasureName}`
											: "—"}
									</TableCell>
									<TableCell>{row.lotReference || "—"}</TableCell>
									<TableCell>
										{row.expiryDate
											? new Date(row.expiryDate).toLocaleDateString()
											: "—"}
									</TableCell>
									<TableCell>
										{new Date(row.receivedAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<Tooltip title="Locate in 3D">
											<IconButton
												size="small"
												aria-label="locate palette in 3D"
												color="warning"
												onClick={() => {
													setLocatorTarget({
														palettierName: row.palettierName,
														positionX: row.positionX,
														positionY: row.positionY,
														positionZ: row.positionZ,
														productName: row.productName || "Palette",
													});
												}}
											>
												<PlaceIcon fontSize="small" />
											</IconButton>
										</Tooltip>
										{isFirstForPalette && (
											<>
												<IconButton
													size="small"
													aria-label="palette actions"
													onClick={(e) => {
														handleMenuOpen(e, row);
													}}
												>
													<MoreVert fontSize="small" />
												</IconButton>
												{(() => {
													const paletteViolations = violationsMap?.get(
														row.paletteId,
													);
													if (!paletteViolations) return null;
													return (
														<Chip
															icon={<WarningAmber />}
															label={`${String(paletteViolations.length)} violation(s)`}
															aria-label={`View ${String(paletteViolations.length)} violation(s) details`}
															color="warning"
															size="small"
															variant="outlined"
															onClick={() => {
																setViewViolationsPaletteId(row.paletteId);
															}}
														/>
													);
												})()}
											</>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>

			<Menu
				anchorEl={menuAnchor}
				open={Boolean(menuAnchor)}
				onClose={handleMenuClose}
			>
				<MenuItem onClick={handleModify}>
					<ListItemIcon>
						<Edit fontSize="small" />
					</ListItemIcon>
					Modify
				</MenuItem>
				<MenuItem onClick={handleRemoveClick} sx={{ color: "error.main" }}>
					<ListItemIcon sx={{ color: "error.main" }}>
						<Delete fontSize="small" />
					</ListItemIcon>
					Remove
				</MenuItem>
			</Menu>

			<Dialog
				open={confirmDeleteId !== null}
				onClose={() => {
					setConfirmDeleteId(null);
				}}
			>
				<DialogTitle>Remove Palette</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This palette will be permanently removed. This action cannot be
						undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							setConfirmDeleteId(null);
						}}
					>
						Cancel
					</Button>
					<Button
						color="error"
						disabled={deleteMutation.isPending}
						onClick={() => {
							void handleConfirmDelete();
						}}
					>
						Remove
					</Button>
				</DialogActions>
			</Dialog>

			<PositionEditDialog
				open={editPalette !== null}
				onClose={() => {
					setEditPalette(null);
				}}
				palette={editPalette}
			/>
			<PaletteLocatorDialog
				open={locatorTarget !== null}
				onClose={() => {
					setLocatorTarget(null);
				}}
				palettierName={locatorTarget?.palettierName ?? ""}
				positionX={locatorTarget?.positionX ?? 0}
				positionY={locatorTarget?.positionY ?? 0}
				positionZ={locatorTarget?.positionZ ?? 0}
				productName={locatorTarget?.productName ?? ""}
			/>
			<ViolationAlertDialog
				open={viewViolationsPaletteId !== null}
				onClose={() => {
					setViewViolationsPaletteId(null);
				}}
				violations={violationsMap?.get(viewViolationsPaletteId ?? -1) ?? []}
			/>
		</>
	);
};

export default PaletteTable;
