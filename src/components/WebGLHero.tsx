import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'

export default function WebGLHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetRotation = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x050505)
    scene.fog = new THREE.FogExp2(0x050505, 0.02)

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 1.2, 6.8)
    camera.lookAt(0, 0.2, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    // Post-processing
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.9, // strength
      0.87, // radius
      0.95 // threshold
    )
    composer.addPass(bloomPass)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a5cff, 0.3)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x1a5cff, 2, 20)
    pointLight1.position.set(2, 4, 3)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x3a8bff, 1.5, 20)
    pointLight2.position.set(-3, 2, 4)
    scene.add(pointLight2)

    // Central object (winged star)
    const objectGroup = new THREE.Group()

    // 8 spheres in a circle
    const sphereCount = 8
    const circleRadius = 1
    for (let i = 0; i < sphereCount; i++) {
      const angle = (i / sphereCount) * Math.PI * 2
      const sphereGeo = new THREE.SphereGeometry(0.25, 32, 32)
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x1a5cff,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x1a5cff,
        emissiveIntensity: 0.3,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(
        Math.cos(angle) * circleRadius,
        Math.sin(angle) * 0.6,
        Math.sin(angle) * circleRadius
      )
      objectGroup.add(sphere)
    }

    // Wings - 2 ExtrudeGeometry
    const wingShape = new THREE.Shape()
    wingShape.moveTo(0, 0)
    wingShape.quadraticCurveTo(1.5, 1.5, 3, 0.5)
    wingShape.quadraticCurveTo(1.5, 0, 0, 0)

    const extrudeSettings = {
      steps: 2,
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    }

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings)
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1a5cff,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x1a5cff,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.8,
    })

    const wing1 = new THREE.Mesh(wingGeo, wingMat)
    wing1.scale.set(1, 0.6, 1)
    wing1.position.set(-0.2, 0.4, 0)
    wing1.rotation.y = 0.3
    objectGroup.add(wing1)

    const wing2 = new THREE.Mesh(wingGeo, wingMat)
    wing2.scale.set(-1, 0.6, 1)
    wing2.position.set(0.2, 0.4, 0)
    wing2.rotation.y = -0.3
    objectGroup.add(wing2)

    scene.add(objectGroup)

    // Particles
    const particleCount = 800
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities: number[] = []

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = Math.random() * 20 - 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      velocities.push(0.5 + Math.random() * 1.5)
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const particleMat = new THREE.PointsMaterial({
      color: 0x3a8bff,
      size: 0.09,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Reflector floor
    const reflectorGeo = new THREE.PlaneGeometry(100, 100)
    const reflector = new Reflector(reflectorGeo, {
      clipBias: 0.003,
      textureWidth: window.innerWidth * Math.min(window.devicePixelRatio, 2),
      textureHeight: window.innerHeight * Math.min(window.devicePixelRatio, 2),
      color: 0x111111,
    })
    reflector.position.y = -1.5
    reflector.rotation.x = -Math.PI / 2 - 0.05
    scene.add(reflector)

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // Animation loop
    let animId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Object hover animation
      objectGroup.position.y = Math.sin(elapsed * 1.2) * 0.25

      // Mouse follow with lerp
      targetRotation.current.x = mouseRef.current.y * 0.0003
      targetRotation.current.y = mouseRef.current.x * 0.0005
      objectGroup.rotation.x += (targetRotation.current.x - objectGroup.rotation.x) * 0.05
      objectGroup.rotation.y += (targetRotation.current.y - objectGroup.rotation.y) * 0.05

      // Wing rotation
      wing1.rotation.z = Math.sin(elapsed * 0.8) * 0.1
      wing2.rotation.z = -Math.sin(elapsed * 0.8) * 0.1

      // Update particles
      const posArray = particleGeo.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 1] -= velocities[i] * 0.003
        if (posArray[i * 3 + 1] < -3) {
          posArray[i * 3 + 1] = 18
          posArray[i * 3] = (Math.random() - 0.5) * 30
          posArray[i * 3 + 2] = (Math.random() - 0.5) * 30
        }
      }
      particleGeo.attributes.position.needsUpdate = true

      // Particles follow mouse slightly
      particles.rotation.y += (mouseRef.current.x * 0.1 - particles.rotation.y) * 0.01

      composer.render()
    }

    animate()

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
      bloomPass.resolution.set(window.innerWidth, window.innerHeight)
      reflector.getRenderTarget().setSize(
        window.innerWidth * Math.min(window.devicePixelRatio, 2),
        window.innerHeight * Math.min(window.devicePixelRatio, 2)
      )
    }
    window.addEventListener('resize', handleResize)

    // Fade in
    renderer.domElement.style.opacity = '0'
    renderer.domElement.style.transition = 'opacity 0.8s ease'
    setTimeout(() => {
      renderer.domElement.style.opacity = '1'
    }, 100)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      // Освобождаем GPU-ресурсы: без этого каждый переход на лендинг копит утечку
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(material)) material.forEach((m) => m.dispose())
        else if (material) material.dispose()
      })
      reflector.getRenderTarget().dispose()
      composer.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    />
  )
}
