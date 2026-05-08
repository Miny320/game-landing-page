"use client";

import React, { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false }); // Optimization: no alpha channel if background is solid
    if (!ctx) return;

    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 };
    let scrollY = 0;
    let width = 0;
    let height = 0;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      originalX: number;
      originalY: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.originalX = this.x;
        this.originalY = this.y;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.2 - 0.1;
        this.speedY = Math.random() * 0.2 - 0.1;
        this.color = Math.random() > 0.5 ? "#00F5D4" : "#FFFFFF";
      }

      update() {
        this.originalX += this.speedX;
        this.originalY += this.speedY;

        if (this.originalX > width) this.originalX = 0;
        if (this.originalX < 0) this.originalX = width;
        if (this.originalY > height) this.originalY = 0;
        if (this.originalY < 0) this.originalY = height;

        // Optimized distance calculation (squared distance to avoid Math.sqrt)
        const dx = mouse.x - this.originalX;
        const dy = (mouse.y + scrollY) - this.originalY;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < 40000) { // 200px radius
            const distance = Math.sqrt(distSq);
            const force = (200 - distance) / 200;
            this.x = this.originalX - dx * force * 0.2;
            this.y = this.originalY - dy * force * 0.2;
        } else {
            this.x = this.originalX;
            this.y = this.originalY;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y - scrollY, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      width = window.innerWidth;
      height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      canvas.width = width;
      canvas.height = height;
      
      particles = [];
      // Reduced density slightly for better performance
      const count = Math.floor((width * height) / 12000);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    let animationFrameId: number;
    const animate = () => {
      // Use a darker solid fill instead of clearRect for better perf with alpha:false
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);
      
      ctx.globalAlpha = 0.3; // Global opacity is cheaper than per-particle shadow
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-5] pointer-events-none will-change-transform"
    />
  );
}
