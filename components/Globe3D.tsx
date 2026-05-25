import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// African trade hub locations
const AFRICAN_TRADE_HUBS = [
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, color: '#E8B547' },
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219, color: '#E8B547' },
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, color: '#E8B547' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, color: '#E8B547' },
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898, color: '#E8B547' },
  { name: 'Accra', lat: 5.6037, lng: -0.187, color: '#E8B547' },
  { name: 'Addis Ababa', lat: 9.0320, lng: 38.7469, color: '#E8B547' },
  { name: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, color: '#E8B547' },
];

// Trade route connections (pairs of city indices)
const TRADE_ROUTES = [
  [0, 1], // Lagos to Nairobi
  [1, 2], // Nairobi to Johannesburg
  [0, 3], // Lagos to Cairo
  [3, 4], // Cairo to Casablanca
  [0, 5], // Lagos to Accra
  [1, 6], // Nairobi to Addis Ababa
  [1, 7], // Nairobi to Dar es Salaam
  [2, 7], // Johannesburg to Dar es Salaam
];

// Convert latitude/longitude to 3D coordinates
function lon2xyz(R: number, longitude: number, latitude: number): THREE.Vector3 {
  let lon = (longitude * Math.PI) / 180;
  const lat = (latitude * Math.PI) / 180;
  lon = -lon;

  const x = R * Math.cos(lat) * Math.cos(lon);
  const y = R * Math.sin(lat);
  const z = R * Math.cos(lat) * Math.sin(lon);

  return new THREE.Vector3(x, y, z);
}

// Create arc curve between two points
function createArc(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number
): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  const distance = start.distanceTo(end);
  const height = radius + distance * 0.25;

  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const point = new THREE.Vector3().lerpVectors(start, end, t);
    const arcFactor = Math.sin(t * Math.PI);
    point.normalize().multiplyScalar(radius + (height - radius) * arcFactor);
    points.push(point);
  }

  return new THREE.CatmullRomCurve3(points);
}

interface Globe3DProps {
  width?: number;
  height?: number;
}

export const Globe3D: React.FC<Globe3DProps> = ({ width = 450, height = 350 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const globeRadius = 80;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(0, 40, 200);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI * 0.3;
    controls.maxPolarAngle = Math.PI * 0.7;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 50, 100);
    scene.add(directionalLight);

    const secondaryLight = new THREE.DirectionalLight(0x1D4FFF, 0.3);
    secondaryLight.position.set(-100, -50, -100);
    scene.add(secondaryLight);

    // Texture loader
    const textureLoader = new THREE.TextureLoader();

    // Earth sphere with texture
    const earthTexture = textureLoader.load(
      'https://unpkg.com/three-globe@2.24.13/example/img/earth-blue-marble.jpg'
    );
    const bumpMap = textureLoader.load(
      'https://unpkg.com/three-globe@2.24.13/example/img/earth-topology.png'
    );

    const earthGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpMap,
      bumpScale: 0.8,
      shininess: 5,
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Atmosphere glow shader
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.18, 0.31, 1.0, 1.0) * intensity * 1.5;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius * 1.12, 64, 64),
      atmosphereMaterial
    );
    scene.add(atmosphere);

    // Golden outer glow
    const goldenGlowMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.91, 0.71, 0.28, 1.0) * intensity * 0.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const goldenGlow = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius * 1.2, 64, 64),
      goldenGlowMaterial
    );
    scene.add(goldenGlow);

    // Location markers group
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    // Add location markers
    AFRICAN_TRADE_HUBS.forEach((loc) => {
      const coord = lon2xyz(globeRadius * 1.01, loc.lng, loc.lat);

      // Glowing dot
      const dotGeometry = new THREE.SphereGeometry(1.2, 16, 16);
      const dotMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(loc.color),
      });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.copy(coord);
      markersGroup.add(dot);

      // Outer glow ring
      const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(loc.color),
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.copy(coord);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      markersGroup.add(ring);

      // Vertical pillar of light
      const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8, 8);
      const pillarMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(loc.color),
        transparent: true,
        opacity: 0.6,
      });
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      const pillarPos = lon2xyz(globeRadius * 1.05, loc.lng, loc.lat);
      pillar.position.copy(pillarPos);
      pillar.lookAt(new THREE.Vector3(0, 0, 0));
      pillar.rotateX(Math.PI / 2);
      markersGroup.add(pillar);
    });

    // Trade route arcs
    const arcsGroup = new THREE.Group();
    scene.add(arcsGroup);

    TRADE_ROUTES.forEach(([startIdx, endIdx], routeIndex) => {
      const startHub = AFRICAN_TRADE_HUBS[startIdx];
      const endHub = AFRICAN_TRADE_HUBS[endIdx];

      const startPos = lon2xyz(globeRadius * 1.01, startHub.lng, startHub.lat);
      const endPos = lon2xyz(globeRadius * 1.01, endHub.lng, endHub.lat);

      const curve = createArc(startPos, endPos, globeRadius * 1.01);

      // Main arc tube
      const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.25, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: 0xe8b547,
        transparent: true,
        opacity: 0.7,
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      arcsGroup.add(tube);

      // Animated particle along arc
      const particleGeometry = new THREE.SphereGeometry(0.8, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.userData = {
        curve: curve,
        progress: routeIndex * 0.1,
        speed: 0.003 + Math.random() * 0.002,
      };
      arcsGroup.add(particle);
    });

    // Stars background
    const starPositions: number[] = [];
    for (let i = 0; i < 1500; i++) {
      starPositions.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
    }

    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starPositions, 3)
    );

    const starsMaterial = new THREE.PointsMaterial({
      size: 1.2,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Animation loop
    let pulseTime = 0;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      pulseTime += 0.02;

      controls.update();

      // Animate marker rings (pulse effect)
      markersGroup.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
          const scale = 1 + Math.sin(pulseTime + index * 0.5) * 0.3;
          child.scale.set(scale, scale, scale);
          (child.material as THREE.MeshBasicMaterial).opacity =
            0.3 + Math.sin(pulseTime + index * 0.5) * 0.2;
        }
      });

      // Animate arc particles
      arcsGroup.children.forEach((child) => {
        if (child.userData.curve) {
          child.userData.progress += child.userData.speed;
          if (child.userData.progress > 1) {
            child.userData.progress = 0;
          }
          const point = child.userData.curve.getPoint(child.userData.progress);
          child.position.copy(point);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      controls.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      atmosphereMaterial.dispose();
      goldenGlowMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
    };
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className="relative cursor-grab active:cursor-grabbing"
    />
  );
};

export default Globe3D;
