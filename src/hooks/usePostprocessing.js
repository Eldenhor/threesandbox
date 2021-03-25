import { useFrame, useThree, useLoader } from 'react-three-fiber';
import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BlendFunction,
  ChromaticAberrationEffect,
  BloomEffect,
  NoiseEffect,
  PredicationMode,
  SMAAEffect,
  SMAAImageLoader,
  TextureEffect,
  SSAOEffect,
  NormalPass,
  DepthDownsamplingPass,
  SMAAPreset,
  EdgeDetectionMode,
} from 'postprocessing';

function usePostprocessing(reflectorPipeline = []) {
  const {gl, size, scene, camera} = useThree();
  const smaa = useLoader(SMAAImageLoader);

  const [composer] = useMemo(() => {
    const composer = new EffectComposer(gl, {
      frameBufferType: THREE.HalfFloatType,
      multisampling: 0
    });
    const renderPass = new RenderPass(scene, camera);


    const AOSMAA = new SMAAEffect(
        ...smaa,
        SMAAPreset.HIGH,
        EdgeDetectionMode.DEPTH
    );
    AOSMAA.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

    const renderer = composer.getRenderer();
    const capabilities = renderer.capabilities;
    const normalPass = new NormalPass(scene, camera);
    const depthDownsamplingPass = new DepthDownsamplingPass({
      normalBuffer: normalPass.texture,
      resolutionScale: 0.5
    });
    // depthDownsamplingPass.needsSwap = true;
    // depthDownsamplingPass
    const normalDepthBuffer = capabilities.isWebGL2 ?
        depthDownsamplingPass.texture : null;
    const SSAO = new SSAOEffect(camera, normalPass.texture, {
      blendFunction: BlendFunction.MULTIPLY, // intentionally set as normal for better debugging
      depthAwareUpsampling: true,
      distanceScaling: true,
      normalDepthBuffer,
      samples: 9,
      rings: 7,
      distanceThreshold: 0.02, // Render up to a distance of ~20 world units
      distanceFalloff: 0.0025, // with an additional ~2.5 units of falloff.
      rangeThreshold: 0.003, // Occlusion proximity of ~0.3 world units
      rangeFalloff: 0.001, // with ~0.1 units of falloff.
      luminanceInfluence: 0.5,
      radius: 0.15,
      intensity: 4,
      bias: 0.05,
      resolutionScale: 1
    });
    const textureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: depthDownsamplingPass.texture
    });

    const CHROMATIC_ABERRATION = new ChromaticAberrationEffect({
      offset: new THREE.Vector2(0.001, 0.001)
    });
    const BLOOM = new BloomEffect({
      luminanceSmoothing: 0.5,
      luminanceThreshold: 0.6,
      intensity: 1.5
    });
    const NOISE = new NoiseEffect({
      blendFunction: BlendFunction.COLOR_DODGE
    });
    NOISE.blendMode.opacity.value = 0.03;

    // INIT ANTIALIAS
    const SMAA = new SMAAEffect(...smaa);
    SMAA.edgeDetectionMaterial.setEdgeDetectionThreshold(0.05);
    SMAA.edgeDetectionMaterial.setPredicationMode(PredicationMode.DEPTH);
    SMAA.edgeDetectionMaterial.setPredicationThreshold(0.002);
    SMAA.edgeDetectionMaterial.setPredicationScale(1.0);
    const edgesTextureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: SMAA.renderTargetEdges.texture
    });
    const weightsTextureEffect = new TextureEffect({
      blendFunction: BlendFunction.SKIP,
      texture: SMAA.renderTargetWeights.texture
    });
    // END ANTIALIAS


    const effectPass = new EffectPass(camera, SMAA, edgesTextureEffect, weightsTextureEffect, BLOOM, NOISE);
    const aoPass = new EffectPass(camera, AOSMAA, SSAO, textureEffect);
    // const aoPass = new EffectPass(camera, AOSMAA, SSAO, textureEffect);
    const chroAbbPass = new EffectPass(camera, CHROMATIC_ABERRATION);

    reflectorPipeline.forEach((pass) => composer.addPass(pass));

    composer.addPass(renderPass);
    composer.addPass(normalPass);
    composer.addPass(depthDownsamplingPass);
    composer.addPass(aoPass);
    composer.addPass(effectPass)
    composer.addPass(chroAbbPass);

    return [composer];
  }, [gl, scene, camera, reflectorPipeline, smaa]);

  useEffect(() => void composer.setSize(size.width, size.height), [composer, size]);
  useFrame((_, delta) => void composer.render(delta), -1);
}

export default usePostprocessing;
