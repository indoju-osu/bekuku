import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reactive "frost" scene rendered with Three.js.
 *
 * Rendering path: WebGPU when the device exposes it, WebGL as a guaranteed
 * fallback. The whole scene is a single InstancedMesh (one draw call), paused
 * when off-screen or when the tab is hidden, and skipped entirely when the user
 * prefers reduced motion. If neither backend is available the decorative CSS
 * gradient behind the canvas keeps the hero looking intentional.
 */
export function FrostScene({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let disposed = false;
    let frame = 0;
    let cleanup: (() => void) | null = null;

    const boot = async () => {
      try {
        const THREE = await import("three");
        const { WebGLRenderer } = THREE;

        let renderer: {
          setPixelRatio: (value: number) => void;
          setSize: (width: number, height: number) => void;
          render: (scene: import("three").Scene, camera: import("three").Camera) => void;
          dispose: () => void;
          domElement: HTMLCanvasElement;
          outputColorSpace?: string;
        } | null = null;
        let usedWebGpu = false;

        if ("gpu" in navigator) {
          try {
            const webgpu = await import("three/webgpu");
            const gpuRenderer = new webgpu.WebGPURenderer({ antialias: true, alpha: true });
            await gpuRenderer.init();
            renderer = gpuRenderer;
            usedWebGpu = true;
          } catch {
            renderer = null;
          }
        }

        if (!renderer) {
          renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
        }

        if (disposed) {
          renderer.dispose();
          return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
        camera.position.set(0, 0, 7.4);

        const group = new THREE.Group();
        scene.add(group);

        scene.add(new THREE.AmbientLight(0xf8f6f0, 2.1));
        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        key.position.set(3.4, 4.2, 5);
        scene.add(key);
        const rim = new THREE.PointLight(0xd87355, 48, 24);
        rim.position.set(-4.2, -2.6, 3.6);
        scene.add(rim);
        const fill = new THREE.PointLight(0x8b865c, 26, 22);
        fill.position.set(3.6, -3.4, 2.4);
        scene.add(fill);

        const palette = [0xd3bba3, 0xf8f6f0, 0x8b865c, 0xd87355, 0xe8dccb];
        const geometry = new THREE.IcosahedronGeometry(1, 0);
        const material = new THREE.MeshStandardMaterial({
          roughness: 0.32,
          metalness: 0.12,
          flatShading: true,
          transparent: true,
          opacity: 0.92,
        });

        const count = window.innerWidth < 768 ? 44 : 76;
        const mesh = new THREE.InstancedMesh(geometry, material, count);
        mesh.frustumCulled = false;

        const dummy = new THREE.Object3D();
        const color = new THREE.Color();
        const seeds: { x: number; y: number; z: number; scale: number; speed: number; spin: number }[] = [];

        for (let index = 0; index < count; index += 1) {
          const radius = 2.1 + Math.random() * 3.4;
          const angle = Math.random() * Math.PI * 2;
          const height = (Math.random() - 0.5) * 7.6;
          const scale = 0.07 + Math.random() * 0.26;
          seeds.push({
            x: Math.cos(angle) * radius,
            y: height,
            z: Math.sin(angle) * radius * 0.55 - 1.2,
            scale,
            speed: 0.25 + Math.random() * 0.7,
            spin: Math.random() * Math.PI,
          });
          dummy.position.set(seeds[index].x, seeds[index].y, seeds[index].z);
          dummy.scale.setScalar(scale);
          dummy.rotation.set(Math.random(), Math.random(), Math.random());
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
          color.setHex(palette[index % palette.length]);
          mesh.setColorAt(index, color);
        }
        mesh.instanceMatrix.needsUpdate = true;
        group.add(mesh);

        const wireMaterial = new THREE.LineBasicMaterial({
          color: 0x8b865c,
          transparent: true,
          opacity: 0.28,
        });
        const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 24), wireMaterial);
        wire.scale.setScalar(1.55);
        wire.position.set(1.9, 0.6, -2.4);
        group.add(wire);

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
        const canvas = renderer.domElement;
        canvas.className = "frost-canvas";
        canvas.setAttribute("aria-hidden", "true");
        mount.appendChild(canvas);
        setActive(true);

        const resize = () => {
          const { clientWidth, clientHeight } = mount;
          if (!clientWidth || !clientHeight) return;
          renderer?.setSize(clientWidth, clientHeight);
          camera.aspect = clientWidth / clientHeight;
          camera.updateProjectionMatrix();
        };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(mount);

        let visible = true;
        let pageVisible = !document.hidden;
        const onVisibility = () => {
          pageVisible = !document.hidden;
        };
        document.addEventListener("visibilitychange", onVisibility);

        const intersection = new IntersectionObserver(
          (entries) => entries.forEach((entry) => (visible = entry.isIntersecting)),
          { threshold: 0.02 },
        );
        intersection.observe(mount);

        let scrollProgress = 0;
        const onScroll = () => {
          const max = window.innerHeight * 1.15;
          scrollProgress = Math.min(1, Math.max(0, window.scrollY / max));
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        const clock = new THREE.Clock();
        const animate = () => {
          frame = requestAnimationFrame(animate);
          if (!visible || !pageVisible) return;
          const elapsed = clock.getElapsedTime();
          group.rotation.y = elapsed * 0.045 + scrollProgress * 0.5;
          group.rotation.x = Math.sin(elapsed * 0.12) * 0.05 + scrollProgress * 0.28;
          group.position.y = Math.sin(elapsed * 0.32) * 0.08 - scrollProgress * 0.9;
          camera.position.z = 7.4 - scrollProgress * 1.5;
          camera.position.y = scrollProgress * 0.55;
          camera.lookAt(0, 0, 0);
          wire.rotation.y = -elapsed * 0.18;
          wire.rotation.z = Math.sin(elapsed * 0.2) * 0.15;
          for (let index = 0; index < count; index += 1) {
            const seed = seeds[index];
            const drift = Math.sin(elapsed * seed.speed + seed.spin) * 0.22;
            dummy.position.set(seed.x + drift * 0.6, seed.y + drift, seed.z);
            dummy.rotation.set(elapsed * seed.speed * 0.22, elapsed * seed.speed * 0.3, seed.spin);
            dummy.scale.setScalar(seed.scale);
            dummy.updateMatrix();
            mesh.setMatrixAt(index, dummy.matrix);
          }
          mesh.instanceMatrix.needsUpdate = true;
          renderer?.render(scene, camera);
        };
        animate();

        cleanup = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          intersection.disconnect();
          window.removeEventListener("scroll", onScroll);
          document.removeEventListener("visibilitychange", onVisibility);
          geometry.dispose();
          material.dispose();
          wire.geometry.dispose();
          wireMaterial.dispose();
          renderer?.dispose();
          canvas.remove();
        };

        if (usedWebGpu) mount.dataset.backend = "webgpu";
        else mount.dataset.backend = "webgl";
      } catch {
        // Silently fall back to the CSS decoration.
      }
    };

    void boot();

    return () => {
      disposed = true;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_82%_10%,#e8dccb_0%,#f8f6f0_52%,#f3ece1_100%)]" />
      <div
        className={`absolute -right-24 top-4 size-72 rounded-full bg-cream/45 blur-3xl transition-opacity duration-1000 ${
          active ? "opacity-40" : "opacity-80"
        }`}
      />
      <div className="absolute -left-16 bottom-0 size-64 rounded-full bg-olive/15 blur-3xl" />
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
}
