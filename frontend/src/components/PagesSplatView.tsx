import { useRef } from "react";
import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat } from "@playcanvas/react/components";
import { OrbitControls } from "@playcanvas/react/scripts";
import { useAppEvent, useFrame, useSplat } from "@playcanvas/react/hooks";
import { useFaceParallax } from "@/hooks/useFaceParallax";

export default function PagesSplatView({ splatId }: { splatId: string }) {
  return (
    <Application>
      {/* Camera stays fixed */}
      <Entity name="Camera" position={[0, 0, 8]}>
        <Camera />
        <OrbitControls
          distanceMax={Infinity}
          pitchAngleMin={-360}
          pitchAngleMax={360}
        />
      </Entity>

      {/* Only the object moves */}
      <FaceDrivenModel splatId={splatId} />
    </Application>
  );
}

function FaceDrivenModel({ splatId }: { splatId: string }) {
  const { asset: model } = useSplat(
    `https://api-remember.theneocorner.com/static/splats/${splatId}/output/image.ply`,
  );
  const { getRotation } = useFaceParallax({ smoothing: 0.12 });
  const entityRef = useRef<any>(null);

  useAppEvent("update", () => {
    const entity = entityRef.current;
    if (!entity) return;

    const { yaw, pitch, roll } = getRotation();

    // Keep base orientation, then add face rotation on top.
    entity.setLocalEulerAngles(180 + pitch * 15, yaw * 25, roll * 8);
  });

  if (!model) return null;

  return (
    <Entity ref={entityRef} position={[0, 0, 25]}>
      <GSplat asset={model} />
    </Entity>
  );
}
