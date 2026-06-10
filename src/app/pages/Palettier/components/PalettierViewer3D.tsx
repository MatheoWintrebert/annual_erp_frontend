import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox, Grid } from "@react-three/drei";
import type { FC } from "react";
import type { Mesh } from "three";

export interface SlotData {
  x: number;
  y: number;
  z: number;
  paletteId?: number;
  products?: string[];
  isHighlighted?: boolean;
  isTarget?: boolean;
}

interface PalettierViewer3DProps {
  name: string;
  width: number;
  depth: number;
  height: number;
  slots: SlotData[];
  targetPosition?: { x: number; y: number; z: number };
}

const SLOT_SIZE = 1;
const GAP = 0.15;
const CELL = SLOT_SIZE + GAP;
const BEAM_THICKNESS = 0.06;

const COLORS = {
  beam: "#8a8a8a",
  empty: "#3a3a4a",
  occupied: "#77A53C",
  highlighted: "#e040fb",
  highlightedEmissive: "#e040fb",
  target: "#ff6d00",
  targetEmissive: "#ff6d00",
} as const;

const cellToScene = (
  ix: number,
  iy: number,
  iz: number,
  width: number,
  depth: number
): [number, number, number] => [
  (ix + 0.5) * CELL - (width * CELL) / 2,
  iz * CELL,
  (iy + 0.5) * CELL - (depth * CELL) / 2,
];

const TargetMarker: FC<{ position: [number, number, number] }> = ({
  position,
}) => {
  const groupRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = position[1] + SLOT_SIZE * 0.6 + Math.sin(t * 2) * 0.1;
      groupRef.current.rotation.y = t * 1.5;
    }
  });

  return (
    <mesh ref={groupRef} position={[position[0], position[1] + SLOT_SIZE * 0.6, position[2]]}>
      <coneGeometry args={[0.15, 0.3, 4]} />
      <meshStandardMaterial
        color={COLORS.target}
        emissive={COLORS.targetEmissive}
        emissiveIntensity={0.8}
      />
    </mesh>
  );
};

const PaletteBox: FC<{
  position: [number, number, number];
  isOccupied: boolean;
  isHighlighted: boolean;
  isTarget: boolean;
  label: string;
}> = ({ position, isOccupied, isHighlighted, isTarget, label }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current && (isHighlighted || isTarget)) {
      const speed = isTarget ? 4 : 3;
      const amplitude = isTarget ? 0.08 : 0.05;
      const scale = 1 + Math.sin(clock.getElapsedTime() * speed) * amplitude;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  if (!isOccupied && !isHighlighted && !isTarget) {
    return (
      <mesh position={position}>
        <boxGeometry args={[SLOT_SIZE * 0.9, SLOT_SIZE * 0.3, SLOT_SIZE * 0.9]} />
        <meshStandardMaterial
          color={COLORS.empty}
          transparent
          opacity={0.35}
        />
      </mesh>
    );
  }

  const color = isTarget
    ? COLORS.target
    : isHighlighted
      ? COLORS.highlighted
      : COLORS.occupied;
  const emissive = isTarget
    ? COLORS.targetEmissive
    : isHighlighted
      ? COLORS.highlightedEmissive
      : "#000000";
  const emissiveIntensity = isTarget ? 0.8 : isHighlighted ? 0.6 : 0;

  return (
    <group position={position}>
      <RoundedBox
        ref={meshRef}
        args={[SLOT_SIZE * 0.85, SLOT_SIZE * 0.5, SLOT_SIZE * 0.85]}
        radius={0.04}
        smoothness={4}
      >
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
          metalness={0.1}
        />
      </RoundedBox>
      {label && (
        <Text
          position={[0, SLOT_SIZE * 0.35, 0]}
          scale={[-1, 1, 1]}
          fontSize={0.14}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          maxWidth={SLOT_SIZE * 0.8}
          fontWeight={700}
        >
          {label}
        </Text>
      )}
      {isTarget && <TargetMarker position={position} />}
    </group>
  );
};

const RackFrame: FC<{
  width: number;
  depth: number;
  height: number;
}> = ({ width, depth, height }) => {
  const beams = useMemo(() => {
    const result: { key: string; pos: [number, number, number]; size: [number, number, number] }[] = [];

    for (let x = 0; x <= width; x++) {
      for (let z = 0; z <= depth; z++) {
        const px = x * CELL - (width * CELL) / 2;
        const pz = z * CELL - (depth * CELL) / 2;
        result.push({
          key: `v-${String(x)}-${String(z)}`,
          pos: [px, (height * CELL) / 2 - CELL / 2, pz],
          size: [BEAM_THICKNESS, height * CELL, BEAM_THICKNESS],
        });
      }
    }

    for (let y = 0; y < height; y++) {
      const py = y * CELL;
      for (let z = 0; z <= depth; z++) {
        const pz = z * CELL - (depth * CELL) / 2;
        result.push({
          key: `hz-${String(y)}-${String(z)}`,
          pos: [0, py - CELL * 0.25, pz],
          size: [width * CELL + BEAM_THICKNESS, BEAM_THICKNESS, BEAM_THICKNESS],
        });
      }
      for (let x = 0; x <= width; x++) {
        const px = x * CELL - (width * CELL) / 2;
        result.push({
          key: `hx-${String(y)}-${String(x)}`,
          pos: [px, py - CELL * 0.25, 0],
          size: [BEAM_THICKNESS, BEAM_THICKNESS, depth * CELL + BEAM_THICKNESS],
        });
      }
    }

    return result;
  }, [width, depth, height]);

  return (
    <group>
      {beams.map((beam) => (
        <mesh key={beam.key} position={beam.pos}>
          <boxGeometry args={beam.size} />
          <meshStandardMaterial color={COLORS.beam} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

const Scene: FC<PalettierViewer3DProps> = ({
  name,
  width,
  depth,
  height,
  slots,
  targetPosition,
}) => {
  const slotMap = useMemo(() => {
    const map = new Map<string, SlotData>();
    for (const slot of slots) {
      map.set(`${String(slot.x)}-${String(slot.y)}-${String(slot.z)}`, slot);
    }
    return map;
  }, [slots]);

  const paletteBoxes = useMemo(() => {
    const boxes: {
      key: string;
      position: [number, number, number];
      isOccupied: boolean;
      isHighlighted: boolean;
      isTarget: boolean;
      label: string;
    }[] = [];

    // Data convention: positionX → width, positionY → depth, positionZ → height.
    // Positions are 0-indexed in [0, dimension - 1].
    for (let ix = 0; ix < width; ix++) {
      for (let iy = 0; iy < depth; iy++) {
        for (let iz = 0; iz < height; iz++) {
          const key = `${String(ix)}-${String(iy)}-${String(iz)}`;
          const slot = slotMap.get(key);
          const isTarget =
            !!targetPosition &&
            ix === targetPosition.x &&
            iy === targetPosition.y &&
            iz === targetPosition.z;

          boxes.push({
            key,
            position: cellToScene(ix, iy, iz, width, depth),
            isOccupied: !!slot?.paletteId || isTarget,
            isHighlighted: !!slot?.isHighlighted,
            isTarget,
            label: isTarget
              ? `${String(ix)}-${String(iy)}-${String(iz)}`
              : slot?.isHighlighted
                ? (slot.products?.join(", ") ?? "")
                : "",
          });
        }
      }
    }

    return boxes;
  }, [width, depth, height, slotMap, targetPosition]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} />
      <directionalLight position={[-3, 4, -3]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.4} />

      <Text
        position={[0, height * CELL + 0.3, 0]}
        scale={[-1, 1, 1]}
        fontSize={0.3}
        color="#77A53C"
        anchorX="center"
        anchorY="bottom"
        font={undefined}
      >
        {name}
      </Text>

      <RackFrame width={width} depth={depth} height={height} />

      {paletteBoxes.map((box) => (
        <PaletteBox
          key={box.key}
          position={box.position}
          isOccupied={box.isOccupied}
          isHighlighted={box.isHighlighted}
          isTarget={box.isTarget}
          label={box.label}
        />
      ))}

      <Grid
        position={[0, -CELL * 0.5, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#333344"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#444466"
        fadeDistance={25}
        fadeStrength={1}
        infiniteGrid
      />

      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={2}
        maxDistance={Math.max(width, depth, height) * CELL * 4}
      />
    </>
  );
};

const PalettierViewer3D: FC<PalettierViewer3DProps> = (props) => {
  const { width, depth, height, targetPosition } = props;
  const cameraDistance = Math.max(width, depth, height) * CELL * 2.2;

  const cameraPos: [number, number, number] = useMemo(() => {
    if (targetPosition) {
      const [tx, ty, tz] = cellToScene(
        targetPosition.x,
        targetPosition.y,
        targetPosition.z,
        width,
        depth
      );
      const dist = cameraDistance * 0.6;
      return [tx + dist, ty + dist * 0.5, tz + dist];
    }
    return [cameraDistance, cameraDistance * 0.7, cameraDistance];
  }, [targetPosition, width, depth, cameraDistance]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        camera={{
          position: cameraPos,
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        style={{ background: "#121218" }}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
};

export default PalettierViewer3D;
