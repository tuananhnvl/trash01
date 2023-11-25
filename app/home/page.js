"use client"
import * as THREE from 'three'
import { useRef, useEffect, useState } from 'react'
import { useFrame,extend } from '@react-three/fiber'
import { GlobalCanvas, ScrollScene, UseCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import {  useTexture ,shaderMaterial} from '@react-three/drei'
import gsap from 'gsap'


const ShaderMaterialCustom = shaderMaterial(
    {
      time: 0,
      mouseDes: { value: new THREE.Vector2(0.5,0.5) },
      uTexture: { value: null },
      uOut : {value :0.},
      resolution:{value:0.}
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
    uniform float time;
    uniform float uOut;
    uniform sampler2D uTexture;
    uniform vec2 resolution;
    float pointRay(vec2 uv, float size, float smoothing)
    {
        vec2 uvn = uv;
       // uvn.y *= resolution.y/resolution.x; 
        float d = length(uvn);
        
        // d/10.
        // size-smoothing - 0.32, size+smoothing +0.1
        d = smoothstep(size-smoothing - 0.42, size+smoothing, d );
       // d = smoothstep(0.05,0.1, d);
        
        return d;
    }
    
    float sdBox( vec3 p, vec3 b )
    {
      vec3 q = abs(p) - b;
  
      return min(max(q.x,q.y),0.5) ;
     // return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.);
    }

    float sdCir( vec2 p, float r )
    {
      vec2 fuv = p;
      return step(r,distance(p,vec2(0.)));
    }
    
    
    void main() {
      vec3 img =  texture2D(uTexture,vUv).xyz;
      vec3 fill = vec3(0.);
      vec3 rls = vec3(1.); // white
   
      float box = sdBox(vec3(vUv,0.) - vec3(vec2(.5),0.),vec3(vec2(0.),0.));
      
      rls *= box  ;
      

      //rls /= pointRay(vUv  - mouseDes, .01 - sin(time), 0.42 );

      float bombom = pointRay(vUv - mouseDes , .01 , .42 );
    
      rls /= bombom;
     
      float cir = pointRay(vUv  - mouseDes, .01 , 0.32 );
      //rls *= cir;

      rls = step(0.495, rls);
      vec3 jj = rls;
      vec3 outRls = 1.-rls;
    

      gl_FragColor = vec4(vec3(cir),1.);
        
      gl_FragColor = vec4(outRls * img,1.-rls.x);
     // gl_FragColor = vec4(vec3(mouseDes,0.),1.);
    //gl_FragColor=vec4(vec3(mouseDes,1.),1.);
  }
      `
  )
  // declaratively
  extend({ ShaderMaterialCustom })
export default function App() {
  const [isTouch, setTouch] = useState(false)
  useEffect(() => {
    localStorage.clear()
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
              <ExampleComponent id="2"/>
              <ExampleComponent id="3"/>
              <ExampleComponent id="4"/>
              <ExampleComponent id="5"/>
              <ExampleComponent id="6"/>
            </section>
       
            <section>Both these ScrollScenes are tracking DOM elements and scaling their WebGL meshes to fit.</section>
          
         
          </article>
        )}
      </SmoothScrollbar>
    </>
  )
}

function ExampleComponent({id}) {
  const el = useRef(null)
  const size = useRef([])
  const inOut = useRef(0)
  const lock = useRef(false)
  //console.log('2')
  useEffect(() => {
    

    size.current = [el.current.clientWidth,el.current.clientHeight]
    const timeline = gsap.timeline({ overwrite: true })



    el.current.onmousemove = function(e) { 
     
        if(inOut.current === 0 && lock.current === false) return
        let offsetLeft = e.currentTarget.offsetLeft 
        let offsetTop = e.currentTarget.offsetTop 
        const x = e.pageX - offsetLeft; 
        const y = e.pageY - offsetTop; 
       // console.log('move')
      
       let nx = {val : localStorage.getItem(`x${id}`)}
       let ny = {val : localStorage.getItem(`y${id}`)}
       timeline.clear()
       .to(nx,{
          val: x/e.currentTarget.clientWidth,
          duration:.2,
          onUpdate:() => {
            localStorage.setItem(`x${id}`,nx.val)
          }
        }).to(ny,{
          val: y/e.currentTarget.clientHeight,
          duration:.2,
          onUpdate:() => {
            localStorage.setItem(`y${id}`,ny.val)
          
          }
        },"<")
    }
    el.current.onmouseenter = function(e) {
    //  console.log('enter')
      inOut.current = 1
      lock.current = false
      localStorage.setItem(`status${id}`,1)
    }
    el.current.onmouseout = function(e) {
     // console.log('out')
      inOut.current = 0
      lock.current = true
      localStorage.setItem(`status${id}`,0)
      let nx = {val : localStorage.getItem(`x${id}`)}
      let ny = {val : localStorage.getItem(`y${id}`)}
    
      timeline.clear()
      .to(nx,{
        val: .5,
        duration:3,
        ease: "expo.out",
        onUpdate:() => {
          localStorage.setItem(`x${id}`,nx.val)
        },
        onComplete: () => {
        
        }
      }).to(ny,{
        val: .5,
        duration:3,
        ease: "expo.out",
        onUpdate:() => {
          localStorage.setItem(`y${id}`,ny.val)
        
        }
      },"<")
  
    }

  },[el])

  return (
    <>
      <div ref={el} className="Placeholder ScrollScene" id={id} /* style={{height: `${Math.random() * 700 + 350}px !important`}} */></div>
      <UseCanvas>
        <ScrollScene track={el}>
          {(props) => (
           <MeshChild size={size.current} id={id}/>
          )}
        </ScrollScene>
      </UseCanvas>
    </>
  )
}
function MeshChild({size,id}) {
    const mesh = useRef(null)

    const  t = useTexture(['a.jpg','b.jpg','c.jpg','d.jpg','e.jpg','f.jpg'])
    useEffect(() => { 
      localStorage.setItem(`x${id}`,.5)
      localStorage.setItem(`y${id}`,.5)
      localStorage.setItem(`status${id}`,0)
     // console.log(mesh.current.material.uniforms.mouseDes.value)
      mesh.current.material.uniforms.uTexture.value = t[id-1]
    }, [t])
    useFrame((state) => { 

      let posx = Number(localStorage.getItem(`x${id}`))
      let posy = 1.-Number(localStorage.getItem(`y${id}`))
      mesh.current.material.uniforms.resolution.value =  new THREE.Vector2(size[0],size[1])
      mesh.current.material.uniforms.time.value = state.clock.elapsedTime
      mesh.current.material.uniforms.uOut.value = localStorage.getItem(`status${id}`)
      mesh.current.material.uniforms.mouseDes.value = new THREE.Vector2(posx,posy)

   //   console.log(posx,posy)
    })
    return (
      <mesh ref={mesh} >
        <planeGeometry args={[size[0] / 1.0,size[1]/ 1.0]} />
         <shaderMaterialCustom /> 
      </mesh>
    )
  }
  
