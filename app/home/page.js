
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

      float bombom = pointRay(vUv - mouseDes , .03 , .42 );
    
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
  const section = useRef()
  const STORE_OLDPOS= []
  const STORE_POSDOMSCURENT= []
  const DOM_ACTIVE = []
  const listPointDom = useRef([])
  const elementIds = ['box0', 'box1','box2','box3','box4','box5'];
  const SEND_MOUSE = useRef([])
  useEffect(() => {
    

    const listDomWB = document.querySelectorAll('.Placeholder')
    listPointDom.current  = document.querySelectorAll('.span')
    console.log(listPointDom.current)
    for (let i = 0; i < listDomWB.length; i++) {
     
      STORE_OLDPOS.push({x:.5,y:.5})
      STORE_POSDOMSCURENT.push({x:.5,y:.5})
      
    }

    // Get the container element
    const con = document.querySelector('.gridgrid');
    
    // Check if the element exists before adding the event listener
    if (con) {
      con.addEventListener('mousemove', handleMoveGlobal);
      animate()
      // Clean up the event listener when the component unmounts
      return () => {
        con.removeEventListener('mousemove', handleMoveGlobal);
      };
    } else {
      console.error('Element with class "container" not found.');
    }

  }, [])
 
   const handleMoveGlobal = (event) => {
  
    const mouseX = event.clientX;
   
    const mouseY = event.clientY;
   
    elementIds.forEach((id) => {
      const el = document.getElementById(id);
      const key = Number(el.getAttribute("data-key"))
      const rect = el.getBoundingClientRect();
      const activeCopy = [...DOM_ACTIVE];
      if (
        mouseX >= rect.left - 50 * 1 && mouseX <= rect.right + 50 * 1 &&
        mouseY >= rect.top - 50 * 1 && mouseY <= rect.bottom + 50 * 1
      ) {
        
              // Calculate normalized coordinates
          const normalizedX = (mouseX - rect.left) / (rect.right - rect.left);
          const normalizedY = (mouseY - rect.top) / (rect.bottom - rect.top);
  
           // Ensure values are within the range [0, 1]
          const clampedX = Math.max(0, Math.min(1, normalizedX));
          const clampedY = Math.max(0, Math.min(1, normalizedY));
          STORE_POSDOMSCURENT[key] = {x:clampedX,y:clampedY}
        //  console.log(`DOM:${id}`,clampedX,clampedY)
        if (!DOM_ACTIVE.includes(key)) {
          DOM_ACTIVE.push(key);
        }
    
        }else{
          const index = activeCopy.indexOf(key);
          if (index !== -1) {
            DOM_ACTIVE.splice(index, 1);
          }
        }
    });
  }
 
function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}
function findNonDuplicateNumbers(arrayA, arrayB) {
  // Find numbers in arrayA that are not in arrayB
  const nonDuplicatesInA = arrayA.filter((num) => !arrayB.includes(num));

  // Find numbers in arrayB that are not in arrayA
  const nonDuplicatesInB = arrayB.filter((num) => !arrayA.includes(num));

  // Concatenate the two sets of non-duplicate numbers
  const result = nonDuplicatesInA.concat(nonDuplicatesInB);

  return result;
}
function animate() {
  requestAnimationFrame(animate)
  const DOM_NOACTIVE = findNonDuplicateNumbers([0,1,2,3,4,5], DOM_ACTIVE);
 
  if(listPointDom.current) {
    for (let i = 0; i < DOM_ACTIVE.length; i++) {
        let a = listPointDom.current[Number(DOM_ACTIVE[i])]
        a.style.left =  `${ (STORE_OLDPOS[Number(DOM_ACTIVE[i])].x ) * 100.}%`
        a.style.top = `${(STORE_OLDPOS[Number(DOM_ACTIVE[i])].y) * 100.}%`
  
         STORE_OLDPOS[Number(DOM_ACTIVE[i])].x = lerp(STORE_OLDPOS[Number(DOM_ACTIVE[i])].x, STORE_POSDOMSCURENT[Number(DOM_ACTIVE[i])].x, .1)
         STORE_OLDPOS[Number(DOM_ACTIVE[i])].y = lerp(STORE_OLDPOS[Number(DOM_ACTIVE[i])].y, STORE_POSDOMSCURENT[Number(DOM_ACTIVE[i])].y, .1)
      
    }
   
    for (let y = 0; y < DOM_NOACTIVE.length; y++) {
   
        let b = listPointDom.current[Number(DOM_NOACTIVE[y])]
        b.style.left =  `${ (STORE_OLDPOS[Number(DOM_NOACTIVE[y])].x ) * 100.}%`
        b.style.top = `${(STORE_OLDPOS[Number(DOM_NOACTIVE[y])].y) * 100.}%`
  
        STORE_OLDPOS[Number(DOM_NOACTIVE[y])].x = lerp(STORE_OLDPOS[Number(DOM_NOACTIVE[y])].x, .5, .05)
        STORE_OLDPOS[Number(DOM_NOACTIVE[y])].y = lerp(STORE_OLDPOS[Number(DOM_NOACTIVE[y])].y, .5, .05)
    }


    for(let m = 0; m < STORE_OLDPOS.length; m++) {
        localStorage.setItem(`x${m}`,STORE_OLDPOS[m].x)
        localStorage.setItem(`y${m}`,STORE_OLDPOS[m].y)
    }
  }
 

}
  return (
    <>
      <GlobalCanvas style={{ pointerEvents: 'auto' }}>
     
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

            <section className='gridgrid' >
              <ExampleComponent id="box0" data="0"/>
              <ExampleComponent id="box1" data="1"/>
              <ExampleComponent id="box2" data="2" />
              <ExampleComponent id="box3" data="3"/>
              <ExampleComponent id="box4" data="4"/>
              <ExampleComponent id="box5" data="5"/>
            </section>
       
            <section>Both these ScrollScenes are tracking DOM elements and scaling their WebGL meshes to fit.</section>
          
         
          </article>
        )}
      </SmoothScrollbar>
    </>
  )
}

function ExampleComponent({id,data,dym}) {
  const el = useRef(null)
  const size = useRef([])
  useEffect(() => {
   
    size.current = [el.current.clientWidth,el.current.clientHeight]

  },[el])

  return (
    <>
      <div ref={el} className="Placeholder ScrollScene" id={id} data-key={data} /* style={{height: `${Math.random() * 700 + 350}px !important`}} */>
        <span className="span"></span>
      </div>
      <UseCanvas>
        <ScrollScene track={el}>
          {(props) => (
           <MeshChild size={size.current} id={id} data={data}/>
          )}
        </ScrollScene>
      </UseCanvas>
    </>
  )
}
function MeshChild({size,id,data}) {
    const mesh = useRef(null)

    const  t = useTexture(['a.jpg','b.jpg','c.jpg','d.jpg','e.jpg','f.jpg'])
    useEffect(() => { 
    //   localStorage.setItem(`x${id}`,.5)
    //   localStorage.setItem(`y${id}`,.5)
    //   localStorage.setItem(`status${id}`,0)
    //  // console.log(mesh.current.material.uniforms.mouseDes.value)
      mesh.current.material.uniforms.uTexture.value = t[data]
    }, [t])
    useFrame((state) => { 
    
      let posx = Number(localStorage.getItem(`x${data}`))
      let posy = 1.-Number(localStorage.getItem(`y${data}`))
      mesh.current.material.uniforms.resolution.value =  new THREE.Vector2(size[0],size[1])
     mesh.current.material.uniforms.time.value = state.clock.elapsedTime
     mesh.current.material.uniforms.uOut.value = localStorage.getItem(`status${id}`)
      mesh.current.material.uniforms.mouseDes.value = new THREE.Vector2(posx,posy)

    })
    return (
      <mesh ref={mesh} >
        <planeGeometry args={[size[0] / 1.0,size[1]/ 1.0]} />
         <shaderMaterialCustom/>
      </mesh>
    )
  }
  
