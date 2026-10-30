import { Composition } from "remotion";
import { Instructivo } from "./Instructivo";
import voz from "./voz.json";

const FPS = 30;

export const Root: React.FC = () => (
  <Composition
    id="Instructivo"
    component={Instructivo}
    fps={FPS}
    width={1280}
    height={720}
    durationInFrames={Math.ceil(voz.duracionSeg * FPS) + 30}
    defaultProps={{}}
  />
);
