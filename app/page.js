"use client"
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber"
import { OrbitControls, useTexture, shaderMaterial } from "@react-three/drei"




const ShaderMaterialCustom = shaderMaterial(
  {
    time: 0,
    mouseDes: { value: new THREE.Vector2(0, 0) },
    uTexture: { value: null }
  },
  `
  precision highp float;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `, 
  `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 mouseDes;
  uniform sampler2D uTexture;
  float pointRay(vec2 uv, float size, float smoothing)
  {
      float d = length(uv);
      
      
      d = smoothstep(size-smoothing, size+smoothing, d);
      
      return d;
  }
  
  float sdBox( vec3 p, vec3 b )
  {
    vec3 q = abs(p) - b;
    return min(max(q.x,q.y),0.72);
  }
  
  
  void main() {
    
    vec3 rls = vec3(1.); // white
 
    float box = sdBox(vec3(vUv,0.) - vec3(.5,.5,0.),vec3(vec2(.2),0.));
  
    rls *= box  ;

    rls /= pointRay(vUv - (mouseDes+.5) , 0.1, 0.6);
    
    rls = step(0.32, rls);

    vec3 img =  texture2D(uTexture,vUv).xyz;

    vec3 fill = vec3(0.);
   
    vec3 outRls = 1.-rls;
    
  gl_FragColor = vec4(outRls * img,1.-rls.x);
  
}
    `
)
// declaratively
extend({ ShaderMaterialCustom })

export default function Home() {
  return (
    <main>
      <div style={{ width: "100vw", height: "100vh",background:'white' }}>
        <Canvas>
        
          <MeshChild pos={[-2, 2, 0]} />
          <MeshChild pos={[2.2, 2, 0]} />
          <MeshChild pos={[-2, -2, 0]} />
          <MeshChild pos={[2.2, -2, 0]} />
        </Canvas>
      </div>
    </main>)
}

function MeshChild({ pos }) {
  const mesh = useRef(null)
  const { mouse } = useThree()
  const texture = useTexture('d.jpg')
  useEffect(() => { 
    mesh.current.material.uniforms.uTexture.value = texture
    mesh.current.position.set(pos[0], pos[1], pos[2]) 
  }, [])
  useFrame(() => { 
    mesh.current.material.uniforms.mouseDes.value = new THREE.Vector2(mouse.x, mouse.y)
  })
  return (
    <mesh ref={mesh} onPointerMove={console.log('hi')}>
      <planeGeometry args={[4, 3, 16, 16]} />
      <shaderMaterialCustom />
   
    </mesh>
  )
}