"use client"
import * as THREE from 'three'
import { useRef, useEffect, useState } from 'react'
import { useFrame,extend,useThree } from '@react-three/fiber'
import { GlobalCanvas, ScrollScene, UseCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import { MeshDistortMaterial, useTexture ,shaderMaterial} from '@react-three/drei'



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
  
      rls /= pointRay(vUv - mouseDes , 0.05, 0.42);
      
      rls = step(0.32, rls);
  
      vec3 img =  texture2D(uTexture,vUv).xyz;
  
      vec3 fill = vec3(0.);
     
      vec3 outRls = 1.-rls;
      
    gl_FragColor = vec4(outRls * img,1.-rls.x);
   // gl_FragColor=vec4(vec3(outRls),1.);
  }
      `
  )
  // declaratively
  extend({ ShaderMaterialCustom })
export default function App() {
  const [isTouch, setTouch] = useState(false)
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    setTouch(isTouch)
  }, [])
  return (
    <>
      <GlobalCanvas style={{ pointerEvents: 'auto' }}>
        <ambientLight />
      </GlobalCanvas>
      <SmoothScrollbar>
        {(bind) => (
          <article {...bind}>
            <header>
              <a href="https://github.com/14islands/r3f-scroll-rig">@14islands/r3f-scroll-rig</a>
            </header>
            <section>
              
              <h1>Basic &lt;ScrollScene/&gt; example</h1>
            </section>
            {isTouch && (
              <section>
                <p style={{ color: 'orange' }}>
                  You are on a touch device which means the WebGL won't sync with the native scroll. Consider disabling ScrollScenes for
                  touch devices, or experiment with the `smoothTouch` setting on Lenis.
                </p>
              </section>
            )}
            <section className='gridgrid'>
            <ExampleComponent id="1"/>
            <ExampleComponent id="3"/>
            <ExampleComponent id="4"/>
            <ExampleComponent id="5"/>
            <ExampleComponent id="6"/>
            </section>
       
            <section>Both these ScrollScenes are tracking DOM elements and scaling their WebGL meshes to fit.</section>
            <ExampleComponent id="2"/>
         
          </article>
        )}
      </SmoothScrollbar>
    </>
  )
}

function ExampleComponent({id}) {
  const el = useRef(null)
  const scrollScene = useRef(null)
  const size = useRef([])
  const togleOut = useRef(true)
 
  //console.log('2')
  useEffect(() => {
    size.current = [el.current.clientWidth,el.current.clientHeight]

    el.current.onmousemove = function(e) { 
      //if(togleOut.current === true) return
        const x = e.pageX - e.currentTarget.offsetLeft; 
        const y = e.pageY - e.currentTarget.offsetTop; 
    //    console.log('move')
        
        localStorage.setItem(`x${id}`,x/e.currentTarget.clientWidth)
        localStorage.setItem(`y${id}`,y/e.currentTarget.clientHeight)
    }
    // el.current.onmouseenter = function(e) {
    //   //console.log('enter')
    //   togleOut.current = false
    //   localStorage.setItem('status',togleOut.current)
    // }
    // el.current.onmouseout = function(e) {
    // //  console.log('out')

    //   togleOut.current = true
    //   localStorage.setItem('status',togleOut.current)
    // }
  },[el])
  
  return (
    <>
      <div ref={el} className="Placeholder ScrollScene" id={id}></div>
      <UseCanvas>
        <ScrollScene track={el}>
          {(props) => (
           <MeshChild size={size.current} keyData={id}/>
          )}
        </ScrollScene>
      </UseCanvas>
    </>
  )
}
function MeshChild({size,keyData}) {
    const mesh = useRef(null)
    const texture = useTexture('d.jpg')
    useEffect(() => { 
      mesh.current.material.uniforms.uTexture.value = texture
    }, [])
    useFrame((state) => { 
      
  
      //console.log(mouseIn)
        //console.log(mouse.x)
       
        let pos = [localStorage.getItem(`x${keyData}`),1.-localStorage.getItem(`y${keyData}`)]
    //     let dif = 0

        
      
    //   if(localStorage.getItem('status') == 'false') {
    //     dif = 1
    //   }else{
    //     dif = 0
    //   }

    //   pos[0] -= dif * state.clock.elapsedTime/100.
    //   pos[1] -= dif * state.clock.elapsedTime/100.
    //   console.log(pos)
     mesh.current.material.uniforms.mouseDes.value = new THREE.Vector2(pos[0],pos[1])
    })
    return (
      <mesh ref={mesh} >
        <planeGeometry args={[size[0],size[1]]} />
         <shaderMaterialCustom /> 
       {/*  <meshBasicMaterial color={'white'}/> */}
      </mesh>
    )
  }
  
