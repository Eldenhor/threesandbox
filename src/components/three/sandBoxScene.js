import React, { useRef, useMemo, useEffect } from 'react';
import styled from "styled-components";
import { Canvas } from "react-three-fiber";
import { OrbitControls, Reflector, Box, useTexture } from "@react-three/drei";
import { Text } from "@react-three/drei";

const SandboxSceneWrapper = styled.div`
  width: 100%;
  height: 800px;
  background-color: rgb(52, 52, 52);
`;


const MyReflector = () => {
  const [floor, normal] = useTexture(['/roughness.jpg', '/apartment_floor_n.jpg']);
  return (
      <Reflector resolution={1024}
                 args={[8, 8]}
                 mirror={0.5}
                 mixBlur={10}
                 minDepthThreshold={0.4}
                 maxDepthThreshold={1.4}
                 depthScale={1}
                 mixStrength={2}
                 rotation={[-Math.PI / 2, 0, Math.PI / 2]}
                 blur={[10, 10]}
                 distortion={0.5}
                 distortionMap={floor}
                 debug={0}>
        {(Material, props) => <Material color="#a0a0a0"
                                        metalness={0.1}
                                        roughnessMap={floor}
                                        roughness={0.4}
                                        {...props} />}
      </Reflector>
  );
};

export const SandBoxScene = () => {

  return (
      <SandboxSceneWrapper>
        <Canvas
            concurrent
            shadowMap
            // gl={{alpha: false}}
            pixelRatio={[1.5, 1.5]}
        >
          <pointLight intensity={5} position={[0, 0, 0]}/>
          <ambientLight intensity={0.5}/>
          <OrbitControls/>
          <React.Suspense fallback={null}>
            <MyReflector/>
          </React.Suspense>
          <Text material-toneMapped={false} strokeColor="#000000" position={[0, 1, 0]} fontSize={2}>Text</Text>
          <Box args={[2, 3, 0.2]} position={[0, 1.6, -3]}>
            <meshPhysicalMaterial color="hotpink"/>
          </Box>
        </Canvas>
      </SandboxSceneWrapper>
  );
};