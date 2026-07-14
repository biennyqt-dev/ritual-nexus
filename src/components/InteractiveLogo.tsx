"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ritualIntroOrder, ritualLinks, type RitualResourceId } from "@/data/ritualLinks";

const MAX_DRAG_ROTATE_X = 8;
const MAX_DRAG_ROTATE_Y = 12;
const MAX_DISPLAY_ROTATE_X = 10;
const MAX_DISPLAY_ROTATE_Y = 14;
const ROTATION_SENSITIVITY = 0.055;
const MAX_VELOCITY = 0.075;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function InteractiveLogo() {
  const reduceMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const [introResourceId, setIntroResourceId] = useState<RitualResourceId | null>(null);
  const [activeResourceId, setActiveResourceId] = useState<RitualResourceId | null>(null);
  const [hoveredResourceId, setHoveredResourceId] = useState<RitualResourceId | null>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRotateX = useRef(0);
  const dragRotateY = useRef(0);
  const velocityX = useRef(0);
  const velocityY = useRef(0);
  const draggingRef = useRef(false);
  const didDragRef = useRef(false);
  const lastPointerTypeRef = useRef("mouse");
  const lastPointerRef = useRef({ x: 0, y: 0, time: 0 });
  const startPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reduceMotion) return;

    const timeouts = ritualIntroOrder.map((id, index) =>
      window.setTimeout(() => setIntroResourceId(id), 420 + index * 360),
    );

    timeouts.push(
      window.setTimeout(
        () => setIntroResourceId(null),
        420 + ritualIntroOrder.length * 360 + 440,
      ),
    );

    return () => timeouts.forEach((timeout) => window.clearTimeout(timeout));
  }, [reduceMotion]);

  useAnimationFrame((time, delta) => {
    if (reduceMotion) return;

    if (!draggingRef.current) {
      const velocityDecay = Math.pow(0.925, delta / 16.67);
      const returnHome = Math.pow(0.987, delta / 16.67);

      dragRotateX.current = clamp(
        (dragRotateX.current + velocityX.current * delta) * returnHome,
        -MAX_DRAG_ROTATE_X,
        MAX_DRAG_ROTATE_X,
      );
      dragRotateY.current = clamp(
        (dragRotateY.current + velocityY.current * delta) * returnHome,
        -MAX_DRAG_ROTATE_Y,
        MAX_DRAG_ROTATE_Y,
      );

      velocityX.current *= velocityDecay;
      velocityY.current *= velocityDecay;

      if (Math.abs(velocityX.current) < 0.00008) velocityX.current = 0;
      if (Math.abs(velocityY.current) < 0.00008) velocityY.current = 0;
    }

    const seconds = time / 1000;
    const idleX = Math.cos(seconds * 0.28) * 1.4;
    const idleY = Math.sin(seconds * 0.34) * 3.1 + Math.cos(seconds * 0.16) * 0.8;

    rotateX.set(clamp(dragRotateX.current + idleX, -MAX_DISPLAY_ROTATE_X, MAX_DISPLAY_ROTATE_X));
    rotateY.set(clamp(dragRotateY.current + idleY, -MAX_DISPLAY_ROTATE_Y, MAX_DISPLAY_ROTATE_Y));
  });

  useEffect(() => {
    if (!activeResourceId) return;

    function closeActiveHotspot(event: PointerEvent) {
      if (stageRef.current?.contains(event.target as Node)) return;
      setActiveResourceId(null);
    }

    window.addEventListener("pointerdown", closeActiveHotspot);

    return () => window.removeEventListener("pointerdown", closeActiveHotspot);
  }, [activeResourceId]);

  function endDrag() {
    draggingRef.current = false;
    setIsDragging(false);
  }

  function handleDragMove(
    clientX: number,
    clientY: number,
    timeStamp: number,
    pointerType: string,
    preventDefault: () => void,
  ) {
    if (!draggingRef.current) return;

    const last = lastPointerRef.current;
    const deltaX = clientX - last.x;
    const deltaY = clientY - last.y;
    const elapsed = Math.max(timeStamp - last.time, 16);
    const totalDeltaX = clientX - startPointerRef.current.x;
    const totalDeltaY = clientY - startPointerRef.current.y;

    if (Math.hypot(totalDeltaX, totalDeltaY) > 5) {
      didDragRef.current = true;
      if (pointerType === "touch" || pointerType === "pen") preventDefault();
    }

    const nextRotateX = clamp(
      dragRotateX.current - deltaY * ROTATION_SENSITIVITY,
      -MAX_DRAG_ROTATE_X,
      MAX_DRAG_ROTATE_X,
    );
    const nextRotateY = clamp(
      dragRotateY.current + deltaX * ROTATION_SENSITIVITY,
      -MAX_DRAG_ROTATE_Y,
      MAX_DRAG_ROTATE_Y,
    );

    velocityX.current = clamp((nextRotateX - dragRotateX.current) / elapsed, -MAX_VELOCITY, MAX_VELOCITY);
    velocityY.current = clamp((nextRotateY - dragRotateY.current) / elapsed, -MAX_VELOCITY, MAX_VELOCITY);
    dragRotateX.current = nextRotateX;
    dragRotateY.current = nextRotateY;
    lastPointerRef.current = { x: clientX, y: clientY, time: timeStamp };
  }

  useEffect(() => {
    if (!isDragging || reduceMotion) return;

    function handleWindowPointerMove(event: PointerEvent) {
      handleDragMove(event.clientX, event.clientY, event.timeStamp, event.pointerType, () => {
        if (event.cancelable) event.preventDefault();
      });
    }

    window.addEventListener("pointermove", handleWindowPointerMove, { passive: false });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [isDragging, reduceMotion]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;

    lastPointerTypeRef.current = event.pointerType;
    draggingRef.current = true;
    didDragRef.current = false;
    setIsDragging(true);
    lastPointerRef.current = { x: event.clientX, y: event.clientY, time: event.timeStamp };
    startPointerRef.current = { x: event.clientX, y: event.clientY };
    velocityX.current = 0;
    velocityY.current = 0;
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion) return;

    handleDragMove(event.clientX, event.clientY, event.timeStamp, event.pointerType, () => {
      if (event.cancelable) event.preventDefault();
    });
  }

  function handleHotspotPointerDown(event: ReactPointerEvent<HTMLAnchorElement>) {
    lastPointerTypeRef.current = event.pointerType;
  }

  function handleHotspotPointerEnter(
    event: ReactPointerEvent<HTMLAnchorElement>,
    resourceId: RitualResourceId,
  ) {
    lastPointerTypeRef.current = event.pointerType;

    if (event.pointerType === "mouse") {
      setHoveredResourceId(resourceId);
    }
  }

  function handleHotspotPointerLeave(
    event: ReactPointerEvent<HTMLAnchorElement>,
    resourceId: RitualResourceId,
  ) {
    if (event.pointerType !== "mouse") return;

    setHoveredResourceId((current) => (current === resourceId ? null : current));
  }

  function handleHotspotFocus(
    event: ReactFocusEvent<HTMLAnchorElement>,
    resourceId: RitualResourceId,
  ) {
    if (event.currentTarget.matches(":focus-visible")) {
      setHoveredResourceId(resourceId);
    }
  }

  function handleHotspotBlur() {
    setActiveResourceId(null);
    setHoveredResourceId(null);
  }

  function handleHotspotClick(
    event: ReactMouseEvent<HTMLAnchorElement>,
    resourceId: RitualResourceId,
  ) {
    const isTouchActivation = lastPointerTypeRef.current !== "mouse" && event.detail !== 0;

    if (!isTouchActivation) return;

    if (activeResourceId !== resourceId) {
      event.preventDefault();
      setActiveResourceId(resourceId);
    }
  }

  function handleClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    if (!didDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    didDragRef.current = false;
  }

  return (
    <motion.div
      ref={stageRef}
      className="logo-stage"
      data-dragging={isDragging ? "true" : undefined}
      onClickCapture={handleClickCapture}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerCancel={endDrag}
      onPointerUp={endDrag}
    >
      <motion.div
        className="logo-orbit-layer"
        style={
          reduceMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                transformPerspective: 1250,
              }
        }
      >
        <Image
          src="/ritual-logo.png"
          alt="Ritual logo"
          fill
          priority
          unoptimized
          sizes="(max-width: 768px) 82vw, 700px"
          className="select-none object-contain"
          draggable={false}
        />

        <div className="hotspot-layer" aria-label="Ritual Nexus resource links">
          {ritualLinks.map((resource) => {
            const intro = introResourceId === resource.id;
            const active = activeResourceId === resource.id;
            const hovered = hoveredResourceId === resource.id;
            return (
              <a
                key={resource.id}
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${resource.title} in a new tab`}
                className="hotspot-anchor"
                data-active={active ? "true" : undefined}
                data-hovered={hovered ? "true" : undefined}
                data-intro={intro ? "true" : undefined}
                data-label-position={resource.labelPosition}
                onBlur={handleHotspotBlur}
                onClick={(event) => handleHotspotClick(event, resource.id)}
                onFocus={(event) => handleHotspotFocus(event, resource.id)}
                onPointerDown={handleHotspotPointerDown}
                onPointerEnter={(event) => handleHotspotPointerEnter(event, resource.id)}
                onPointerLeave={(event) => handleHotspotPointerLeave(event, resource.id)}
                style={{
                  left: `${resource.hotspot.x}%`,
                  top: `${resource.hotspot.y}%`,
                  width: `${resource.hotspot.width}%`,
                  height: `${resource.hotspot.height}%`,
                }}
              >
                <span className="hotspot-glow" aria-hidden="true" />
                <span className="hotspot-label" aria-hidden="true">
                  <span>{resource.title}</span>
                  <span className="hotspot-open-hint">Open</span>
                </span>
              </a>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
