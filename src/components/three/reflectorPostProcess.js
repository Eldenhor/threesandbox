import React from 'react';
import styled from "styled-components";
import { Canvas, useResource } from "react-three-fiber";
import { useReflector } from "../../hooks/useReflector";
import usePostprocessing from "../../hooks/usePostprocessing";
import { Box, OrbitControls, Plane } from "@react-three/drei";

const ReflectorPostProcessWrapper = styled.div`
  width: 100%;
  height: 800px;
  background-color: rgb(52, 52, 52);
`;

const Scene = () => {
  const material = useResource();
  const [meshRef, ReflectorMaterial, passes] = useReflector();
  usePostprocessing(passes);

  return(
      <scene>
        <hemisphereLight/>
        <pointLight/>
        <Box args={[2, 3, 0.2]} position={[0, 1.6, -3]}>
          <meshPhysicalMaterial color="hotpink"/>
        </Box>
        <Plane receiveShadow
               ref={meshRef}
               rotation-x={-Math.PI / 2}
               args={[12, 12, 12]}
        >
          <ReflectorMaterial
              metalness={0.1}
              roughness={0.9}
              clearcoat={0.5}
              reflectorOpacity={0.9}
          />
        </Plane>
      </scene>
  )
}

export const ReflectorPostProcess = () => {
  return (
      <ReflectorPostProcessWrapper>
        <Canvas>
          <OrbitControls/>
          <React.Suspense fallback={null}>
            <Scene/>
          </React.Suspense>
        </Canvas>
      </ReflectorPostProcessWrapper>
  );
};