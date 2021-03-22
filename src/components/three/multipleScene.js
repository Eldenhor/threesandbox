import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import styled from "styled-components";
import { Box, OrbitControls } from "@react-three/drei";


const MultipleSceneWrapper = styled.div`
  width: 100%;
  height: 800px;
  background-color: rgb(52, 52, 52);
`;

const MainScene = () => {
  const scene = useRef();
  const {camera} = useThree();
  useFrame(({gl}) => void ((gl.autoClear = false), gl.clearDepth(), gl.render(scene.current, camera)), 10);
  return (
      <scene ref={scene}>
        <pointLight color="red" intensity={2} position={[0, 2, 0]}/>
        <ambientLight/>
        <Box args={[1, 1, 1]} position={[0, 0, 0]}>
          <meshPhysicalMaterial color="brown"/>
        </Box>
      </scene>
  );
};


const SecondScene = () => {
  const scene = useRef();
  const {camera} = useThree();
  useFrame(({gl}) => void ((gl.autoClear = false), gl.clearDepth(), gl.render(scene.current, camera)), 10);
  return (
      <scene ref={scene}>
        <pointLight color="white" intensity={1} position={[2, 2, 0]}/>
        <ambientLight/>
        <Box args={[1, 1, 1]} position={[2, 0, 0]}>
          <meshPhysicalMaterial color="grey"/>
        </Box>
      </scene>
  );
};


export const MultipleScene = () => {
  return (
      <MultipleSceneWrapper>
        <Canvas
            // concurrent
            shadowMap
            // gl={{alpha: true}}
            pixelRatio={[1, 1]}
        >
          <OrbitControls/>
          <MainScene/>
          <SecondScene/>
        </Canvas>
      </MultipleSceneWrapper>
  );
};