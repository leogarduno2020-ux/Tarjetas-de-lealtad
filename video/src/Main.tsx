import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {MeshGradient} from '@paper-design/shaders-react';
import {useVideoConfig} from 'remotion';

// Cámara 3D orbitando un cubo sobre un fondo de shader (Paper Shaders)
const Cube = () => {
  const frame = useCurrentFrame();
  return (
    <mesh rotation={[frame * 0.03, frame * 0.04, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#ff7a59" />
    </mesh>
  );
};

export const Main = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const angle = interpolate(frame, [0, 90], [0, Math.PI / 2]);
  return (
    <AbsoluteFill style={{background: '#111'}}>
      <MeshGradient
        style={{width, height, position: 'absolute'}}
        colors={['#5100ff', '#00ff80', '#ffcc00', '#ea00ff']}
        speed={0}
        frame={frame * 16}
      />
      <ThreeCanvas width={width} height={height} camera={{position: [Math.sin(angle) * 6, 2, Math.cos(angle) * 6], fov: 50}}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={2} />
        <Cube />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
