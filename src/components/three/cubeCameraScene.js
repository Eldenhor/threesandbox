import * as THREE from "three";
import { Canvas, useFrame, useThree } from "react-three-fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import styled from "styled-components";
import React from "react";

const CanvasWrapper = styled.div`
  width: 100%;
  height: 800px;
  background-color: #222222;
`;


const worldposReplace = /* glsl */`
			#define BOX_PROJECTED_ENV_MAP
			#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP )
				vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );
				#ifdef BOX_PROJECTED_ENV_MAP
					vWorldPosition = worldPosition.xyz;
				#endif
			#endif
			`;

const envmapPhysicalParsReplace = /* glsl */`
			#if defined( USE_ENVMAP )
				#define BOX_PROJECTED_ENV_MAP
				#ifdef BOX_PROJECTED_ENV_MAP
					uniform vec3 cubeMapSize;
					uniform vec3 cubeMapPos;
					varying vec3 vWorldPosition;
					vec3 parallaxCorrectNormal( vec3 v, vec3 cubeSize, vec3 cubePos ) {
						vec3 nDir = normalize( v );
						vec3 rbmax = ( .5 * cubeSize + cubePos - vWorldPosition ) / nDir;
						vec3 rbmin = ( -.5 * cubeSize + cubePos - vWorldPosition ) / nDir;
						vec3 rbminmax;
						rbminmax.x = ( nDir.x > 0. ) ? rbmax.x : rbmin.x;
						rbminmax.y = ( nDir.y > 0. ) ? rbmax.y : rbmin.y;
						rbminmax.z = ( nDir.z > 0. ) ? rbmax.z : rbmin.z;
						float correction = min( min( rbminmax.x, rbminmax.y ), rbminmax.z );
						vec3 boxIntersection = vWorldPosition + nDir * correction;
						return boxIntersection - cubePos;
					}
				#endif
				#ifdef ENVMAP_MODE_REFRACTION
					uniform float refractionRatio;
				#endif
				vec3 getLightProbeIndirectIrradiance( /*const in SpecularLightProbe specularLightProbe,*/ const in GeometricContext geometry, const in int maxMIPLevel ) {
					vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );
					#ifdef ENVMAP_TYPE_CUBE
						#ifdef BOX_PROJECTED_ENV_MAP
							worldNormal = parallaxCorrectNormal( worldNormal, cubeMapSize, cubeMapPos );
						#endif
						vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
						// TODO: replace with properly filtered cubemaps and access the irradiance LOD level, be it the last LOD level
						// of a specular cubemap, or just the default level of a specially created irradiance cubemap.
						#ifdef TEXTURE_LOD_EXT
							vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );
						#else
							// force the bias high to get the last LOD level as it is the most blurred.
							vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );
						#endif
						envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
					#elif defined( ENVMAP_TYPE_CUBE_UV )
						vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
					#else
						vec4 envMapColor = vec4( 0.0 );
					#endif
					return PI * envMapColor.rgb * envMapIntensity;
				}
				// Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
				float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {
					float maxMIPLevelScalar = float( maxMIPLevel );
					float sigma = PI * roughness * roughness / ( 1.0 + roughness );
					float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );
					// clamp to allowable LOD ranges.
					return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );
				}
				vec3 getLightProbeIndirectRadiance( /*const in SpecularLightProbe specularLightProbe,*/ const in vec3 viewDir, const in vec3 normal, const in float roughness, const in int maxMIPLevel ) {
					#ifdef ENVMAP_MODE_REFLECTION
						vec3 reflectVec = reflect( -viewDir, normal );
						// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
						reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
					#else
						vec3 reflectVec = refract( -viewDir, normal, refractionRatio );
					#endif
					reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
					float specularMIPLevel = getSpecularMIPLevel( roughness, maxMIPLevel );
					#ifdef ENVMAP_TYPE_CUBE
						#ifdef BOX_PROJECTED_ENV_MAP
							reflectVec = parallaxCorrectNormal( reflectVec, cubeMapSize, cubeMapPos );
						#endif
						vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
						#ifdef TEXTURE_LOD_EXT
							vec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );
						#else
							vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );
						#endif
						envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
					#elif defined( ENVMAP_TYPE_CUBE_UV )
						vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
					#endif
					return envMapColor.rgb * envMapIntensity;
				}
			#endif
			`;

// const EnvCamera = () => {
//   const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, {
//     format: THREE.RGBFormat,
//     generateMipmaps: true,
//     minFilter: THREE.LinearMipMapLinearFilter
//   });
//
//   const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
//
//   return (
//       <primitive object={cubeCamera}/>
//   );
// };

const SphereGeo = () => {
  // const groundTex = useTexture('TexturesCom_Marble_TilesGeometric3_512_albedo.jpg');

  const geometry = new THREE.IcosahedronGeometry(0.4);
  const material = new THREE.MeshStandardMaterial({
    color: "#00fffb",
    metalness: 0.1,
    roughness: 0.0
  });
  const sphereMesh = new THREE.Mesh(geometry, material);

  return (
      <primitive
          object={sphereMesh}
          position={[0, 1, 0]}
      />
  );
};

const Ground = () => {
  const {scene, gl} = useThree();
  // The cubeRenderTarget is used to generate a texture for the reflective sphere.
  // It must be updated on each frame in order to track camera movement and other changes.
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
  });
  const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
  cubeCamera.position.set(0, -1, 0);
  scene.add(cubeCamera);

  const boxProjectedMat = new THREE.MeshStandardMaterial({
        color: "#234444",
        roughness: 0.1,
        envMap: cubeCamera.renderTarget.texture,
      }
  );

  boxProjectedMat.onBeforeCompile = function ( shader ) {
    //these parameters are for the cubeCamera texture
    shader.uniforms.cubeMapSize = { value: new THREE.Vector3( 200, 200, 100 ) };
    shader.uniforms.cubeMapPos = { value: new THREE.Vector3( 0, - 50, 0 ) };
    //replace shader chunks with box projection chunks
    shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        worldposReplace
    );
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <envmap_physical_pars_fragment>',
        envmapPhysicalParsReplace
    );
  };

  const plane = new THREE.PlaneGeometry(10, 10);

  // const planeMesh = new THREE.Mesh(plane, boxProjectedMat);


  // Update the cubeCamera with current renderer and scene.
  useFrame(() => cubeCamera.update(gl, scene));
  return (
      <mesh
        geometry={plane}
        // material={boxProjectedMat}
      >
        <meshBasicMaterial
            envMap={cubeCamera.renderTarget.texture}
            onBeforeCompile={(shader)=>{
              //these parameters are for the cubeCamera texture
              shader.uniforms.cubeMapSize = { value: new THREE.Vector3( 200, 200, 100 ) };
              shader.uniforms.cubeMapPos = { value: new THREE.Vector3( 0, - 50, 0 ) };
              //replace shader chunks with box projection chunks
              shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader;
              shader.vertexShader = shader.vertexShader.replace(
                  '#include <worldpos_vertex>',
                  worldposReplace
              );
              shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <envmap_physical_pars_fragment>',
                  envmapPhysicalParsReplace
              );
            }}
        />
      </mesh>
  );
};


export const CubeCamera = () => {
  return (
      <CanvasWrapper>
        <Canvas>
          <hemisphereLight intensity={0.1}/>
          <spotLight position={[0.2, 1, 0.2]}/>
          <OrbitControls/>
          <Stars/>
          {/*<EnvCamera/>*/}
          <SphereGeo/>
          <Ground/>
        </Canvas>
      </CanvasWrapper>
  );
};
