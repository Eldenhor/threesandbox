import { useTexture } from "@react-three/drei";
import React, { useEffect, useState } from "react";
import { useFrame } from "react-three-fiber";
import { MeshPhysicalMaterial, DoubleSide, RepeatWrapping } from "three";

class ReflectorMaterialImpl extends MeshPhysicalMaterial {
  _flowMapOffset0;
  _flowMapOffset1;
  _tDiffuse;
  _textureMatrix;
  _reflectorOpacity;
  _tNormalMap0;
  _tNormalMap1;

  constructor(parameters = {}) {
    super(parameters);
    this.setValues(parameters);
    this._flowMapOffset0 = {value: null};
    this._flowMapOffset1 = {value: null};
    this._tDiffuse = {value: null};
    this._tNormalMap0 = {value: null};
    this._tNormalMap1 = {value: null};
    this._textureMatrix = {value: null};
    this._reflectorOpacity = {value: 0.2};
  }

  onBeforeCompile(shader) {
    shader.uniforms.flowMapOffset0 = this._flowMapOffset0;
    shader.uniforms.flowMapOffset1 = this._flowMapOffset1;
    shader.uniforms.tDiffuse = this._tDiffuse;
    shader.uniforms.tNormalMap0 = this._tNormalMap0;
    shader.uniforms.tNormalMap1 = this._tNormalMap1;
    shader.uniforms.textureMatrix = this._textureMatrix;
    shader.uniforms.reflectorOpacity = this._reflectorOpacity;

    shader.vertexShader = `
        uniform mat4 textureMatrix;
        varying vec4 my_vUv;
     
      ${shader.vertexShader}
    `;
    shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        `
        #include <project_vertex>
        my_vUv = textureMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        `
    );

    shader.fragmentShader = `
        uniform sampler2D tDiffuse;
        uniform float flowMapOffset0;
        uniform float flowMapOffset1;
        uniform float reflectorOpacity;
        uniform sampler2D tNormalMap0;
        uniform sampler2D tNormalMap1;
        varying vec4 my_vUv;
        ${shader.fragmentShader}
    `;
    shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
        #include <map_fragment>

        float halfCycle = 1.0/2.0;
        float scale = 1.0;
        vec3 toEye = normalize( vec3(1.0,1.0,0.0) );
        
        // determine flow direction
        vec2 flow = vec2(0.8,0.3);
        flow.x *= - 1.0;
        
        // sample normal maps (distort uvs with flowdata)
        vec4 normalColor0 = texture2D( tNormalMap0, ( vUv * scale ) + flow * flowMapOffset0 );
        vec4 normalColor1 = texture2D( tNormalMap1, ( vUv * scale ) + flow * flowMapOffset1 );
        
        // linear interpolate to get the final normal color
        float flowLerp = abs( halfCycle - flowMapOffset0 ) / halfCycle;
        vec4 normalColor = mix( normalColor0, normalColor1, flowLerp );
        
        // calculate normal vector
        vec3 my_normal = normalize( vec3( normalColor.r * 2.0 - 1.0, normalColor.b,  normalColor.g * 2.0 - 1.0 ) );
        
        // calculate the fresnel term to blend reflection and refraction maps
        float theta = max( dot( toEye, my_normal ), 0.0 );
        float reflectance = 1.0 + ( 1.0 - 1.0 ) * pow( ( 1.0 - theta ), 5.0 );
        
        // calculate final uv coords
        vec3 coord = my_vUv.xyz / my_vUv.w;
        vec2 uv = coord.xy + coord.z * my_normal.xz * 0.05;
        
        vec4 myTexelRoughness = texture2D( roughnessMap, vUv );
        // vec4 baseWater = texture2D( tDiffuse, uv);
        vec4 base = texture2DProj( tDiffuse, my_vUv );
        // vec4 mixedBase = mix(base, baseWater, myTexelRoughness.r > 0.5 ? 0.4 : 0.8);
        // vec4 mixedBase = mix(base, myTexelRoughness, myTexelRoughness.r > 0.5 ? 0.2 : 0.8);
        vec4 mixedBase = mix(base, base, myTexelRoughness.r > 0.5 ? 0.2 : 0.8);
        mixedBase *= 1.0 - myTexelRoughness.g;
        diffuseColor.rgb += reflectorOpacity * mixedBase.rgb * 1.2;
      `
    );
  }

  get flowMapOffset0() {
    return this._flowMapOffset0.value;
  }

  set flowMapOffset0(v) {
    this._flowMapOffset0.value = v;
  }

  get flowMapOffset1() {
    return this._flowMapOffset1.value;
  }

  set flowMapOffset1(v) {
    this._flowMapOffset1.value = v;
  }

  get tDiffuse() {
    return this._tDiffuse.value;
  }

  set tDiffuse(v) {
    this._tDiffuse.value = v;
  }

  get tNormalMap0() {
    return this._tNormalMap0.value;
  }

  set tNormalMap0(v) {
    this._tNormalMap0.value = v;
  }

  get tNormalMap1() {
    return this._tNormalMap1.value;
  }

  set tNormalMap1(v) {
    this._tNormalMap1.value = v;
  }

  get textureMatrix() {
    return this._textureMatrix.value;
  }

  set textureMatrix(v) {
    this._textureMatrix.value = v;
  }

  get reflectorOpacity() {
    return this._reflectorOpacity.value;
  }

  set reflectorOpacity(v) {
    this._reflectorOpacity.value = v;
  }
}

export const ReflectorMaterial = ({savePass, textureMatrix}) =>
    React.forwardRef((props, ref) => {
      const [material] = useState(() => new ReflectorMaterialImpl());
      // const cycle = 1.0;
      // const halfCycle = cycle / 2;
      // const flowSpeed = 100;

      const [
        baseMap,
        aoMap,
        heightMap,
        normalMap,
        roughnessMap] = useTexture([
        "/apartment_floor_bc.jpg", // base
        "/ao.jpg", // ao
        "/alpha.jpg", // height
        "/apartment_floor_n.jpg", // normal
        "/roughness.jpg", // roughness
      ]);
      return (
          <primitive
              object={material}
              ref={ref}
              attach="material"
              {...props}
              textureMatrix={textureMatrix}
              tDiffuse={savePass.renderTarget.texture}
              // side={DoubleSide}
              map={baseMap}
              aoMap={aoMap}
              myMap={heightMap}
              // displacementMap={heightMap}
              // displacementScale={0.5}
              normalMap={normalMap}
              normalScale={[0.1, 0.1]}
              roughnessMap={roughnessMap}
              roughness={0.5}
              // tNormalMap0={water[0]}
              // tNormalMap1={water[1]}
          />
      );
    });
