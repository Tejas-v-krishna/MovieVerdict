"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { signupAction } from "@/app/[locale]/(auth)/signup/actions";
import * as THREE from "three";
import Link from "next/link";

// --- Shared Components (Canvas, Shader, Navbar) ---
// (Identical to sign-in-flow-1.tsx)

type Uniforms = {
    [key: string]: {
        value: number[] | number[][] | number;
        type: string;
    };
};

interface ShaderProps {
    source: string;
    uniforms: {
        [key: string]: {
            value: number[] | number[][] | number;
            type: string;
        };
    };
    maxFps?: number;
}

interface SignUpPageProps {
    className?: string;
}

export const CanvasRevealEffect = ({
    animationSpeed = 10,
    opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
    colors = [[0, 255, 255]],
    containerClassName,
    dotSize,
    showGradient = true,
    reverse = false,
}: {
    animationSpeed?: number;
    opacities?: number[];
    colors?: number[][];
    containerClassName?: string;
    dotSize?: number;
    showGradient?: boolean;
    reverse?: boolean;
}) => {
    return (
        <div className={cn("h-full relative w-full", containerClassName)}>
            <div className="h-full w-full">
                <DotMatrix
                    colors={colors ?? [[0, 255, 255]]}
                    dotSize={dotSize ?? 3}
                    opacities={opacities ?? [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1]}
                    shader={`
            ${reverse ? 'u_reverse_active' : 'false'}_;
            animation_speed_factor_${animationSpeed.toFixed(1)}_;
          `}
                    center={["x", "y"]}
                />
            </div>
            {showGradient && (
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            )}
        </div>
    );
};

interface DotMatrixProps {
    colors?: number[][];
    opacities?: number[];
    totalSize?: number;
    dotSize?: number;
    shader?: string;
    center?: ("x" | "y")[];
}

const DotMatrix: React.FC<DotMatrixProps> = ({
    colors = [[0, 0, 0]],
    opacities = [0.04, 0.04, 0.04, 0.04, 0.04, 0.08, 0.08, 0.08, 0.08, 0.14],
    totalSize = 20,
    dotSize = 2,
    shader = "",
    center = ["x", "y"],
}) => {
    const uniforms = React.useMemo(() => {
        let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
        if (colors.length === 2) {
            colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
        } else if (colors.length === 3) {
            colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
        }
        return {
            u_colors: {
                value: colorsArray.map((color) => [color[0] / 255, color[1] / 255, color[2] / 255]),
                type: "uniform3fv",
            },
            u_opacities: { value: opacities, type: "uniform1fv" },
            u_total_size: { value: totalSize, type: "uniform1f" },
            u_dot_size: { value: dotSize, type: "uniform1f" },
            u_reverse: {
                value: shader.includes("u_reverse_active") ? 1 : 0,
                type: "uniform1i",
            },
        };
    }, [colors, opacities, totalSize, dotSize, shader]);

    return (
        <Shader
            source={`
        precision mediump float;
        in vec2 fragCoord;
        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;
        out vec4 fragColor;
        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) { return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x); }
        void main() {
            vec2 st = fragCoord.xy;
            ${center.includes("x") ? "st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));" : ""}
            ${center.includes("y") ? "st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));" : ""}
            float opacity = step(0.0, st.x) * step(0.0, st.y);
            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / 5.0) + show_offset + 5.0));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
            vec3 color = u_colors[int(show_offset * 6.0)];
            float animation_speed_factor = 0.5;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);
            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);
            float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
            float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);
            float current_timing_offset = (u_reverse == 1) ? timing_offset_outro : timing_offset_intro;
            if (u_reverse == 1) {
                 opacity *= 1.0 - step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            } else {
                 opacity *= step(current_timing_offset, u_time * animation_speed_factor);
                 opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
            }
            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }`}
            uniforms={uniforms}
            maxFps={60}
        />
    );
};

const ShaderMaterial = ({ source, uniforms, maxFps = 60 }: { source: string; hovered?: boolean; maxFps?: number; uniforms: Uniforms }) => {
    const { size } = useThree();
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const material: any = ref.current.material;
        material.uniforms.u_time.value = clock.getElapsedTime();
    });
    const getUniforms = () => {
        const preparedUniforms: any = {};
        for (const uniformName in uniforms) {
            const uniform: any = uniforms[uniformName];
            switch (uniform.type) {
                case "uniform1f": preparedUniforms[uniformName] = { value: uniform.value, type: "1f" }; break;
                case "uniform1i": preparedUniforms[uniformName] = { value: uniform.value, type: "1i" }; break;
                case "uniform3f": preparedUniforms[uniformName] = { value: new THREE.Vector3().fromArray(uniform.value), type: "3f" }; break;
                case "uniform1fv": preparedUniforms[uniformName] = { value: uniform.value, type: "1fv" }; break;
                case "uniform3fv": preparedUniforms[uniformName] = { value: uniform.value.map((v: number[]) => new THREE.Vector3().fromArray(v)), type: "3fv" }; break;
                case "uniform2f": preparedUniforms[uniformName] = { value: new THREE.Vector2().fromArray(uniform.value), type: "2f" }; break;
            }
        }
        preparedUniforms["u_time"] = { value: 0, type: "1f" };
        preparedUniforms["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
        return preparedUniforms;
    };
    const material = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: `precision mediump float; in vec2 coordinates; uniform vec2 u_resolution; out vec2 fragCoord; void main(){ float x = position.x; float y = position.y; gl_Position = vec4(x, y, 0.0, 1.0); fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution; fragCoord.y = u_resolution.y - fragCoord.y; }`,
        fragmentShader: source,
        uniforms: getUniforms(),
        glslVersion: THREE.GLSL3,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
    }), [size.width, size.height, source]);
    return <mesh ref={ref as any}><planeGeometry args={[2, 2]} /><primitive object={material} attach="material" /></mesh>;
};

const Shader: React.FC<ShaderProps> = ({ source, uniforms, maxFps = 60 }) => {
    return <Canvas className="absolute inset-0 h-full w-full"><ShaderMaterial source={source} uniforms={uniforms} maxFps={maxFps} /></Canvas>;
};

function MiniNavbar() {
    return (
        <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center pl-6 pr-6 py-3 backdrop-blur-sm rounded-full border border-[#333] bg-[#1f1f1f57] w-auto">
            <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
                <Link href="/" className="text-white font-bold">MovieVerdict</Link>
                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <button className="px-4 py-2 sm:px-3 text-xs sm:text-sm border border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 rounded-full hover:border-white/50 hover:text-white transition-colors">Log In</button>
                    </Link>
                    <Link href="/signup">
                        <button className="px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold text-black bg-white rounded-full hover:bg-gray-200 transition-colors">Sign Up</button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

// --- SignUp Page Component ---

export const SignUpPage = ({ className }: SignUpPageProps) => {
    const [email, setEmail] = useState("");
    const [handle, setHandle] = useState("");
    const [password, setPassword] = useState("");

    const [step, setStep] = useState<"email" | "handle" | "password" | "success">("email");
    const [loading, setLoading] = useState(false);

    const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
    const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

    const router = useRouter();

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) setStep("handle");
    };

    const handleHandleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (handle) setStep("password");
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Visual feedback
        setReverseCanvasVisible(true);
        setTimeout(() => setInitialCanvasVisible(false), 50);

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("handle", handle);
            formData.append("password", password);

            const result = await signupAction(formData);

            if (result?.error) {
                setReverseCanvasVisible(false);
                setInitialCanvasVisible(true);
                alert("Signup Failed: " + result.error);
                setLoading(false);
            } else {
                // Check logic in signupAction - it redirects on success, 
                // so we might not reach here if not using preventDefault/fetch manually.
                // But since we are calling a Server Action from client, it returns result if no redirect,
                // or redirects implicitly.
            }
        } catch (err) {
            console.error(err);
            // If redirect happens it might throw NEXT_REDIRECT error which we should let bubble or handle? 
            // deeply nested nextJS actions usually just work.
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === "password") setStep("handle");
        else if (step === "handle") setStep("email");
    };

    return (
        <div className={cn("flex w-[100%] flex-col min-h-screen bg-black relative overflow-hidden", className)}>
            <div className="absolute inset-0 z-0">
                {initialCanvasVisible && (
                    <div className="absolute inset-0">
                        <CanvasRevealEffect
                            animationSpeed={3}
                            containerClassName="bg-black"
                            colors={[[255, 0, 128], [255, 0, 128]]} // Pink/Red for signup
                            dotSize={6}
                        />
                    </div>
                )}
                {reverseCanvasVisible && (
                    <div className="absolute inset-0">
                        <CanvasRevealEffect
                            animationSpeed={4}
                            containerClassName="bg-black"
                            colors={[[255, 0, 128], [255, 0, 128]]}
                            dotSize={6}
                            reverse={true}
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col flex-1">
                <MiniNavbar />

                <div className="flex flex-1 flex-col justify-center items-center">
                    <div className="w-full mt-[100px] max-w-sm px-4">
                        <AnimatePresence mode="wait">

                            {/* EMAIL STEP */}
                            {step === "email" && (
                                <motion.div
                                    key="email"
                                    initial={{ opacity: 0, x: -100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="space-y-6 text-center"
                                >
                                    <div className="space-y-1">
                                        <h1 className="text-4xl font-bold text-white">Join Us</h1>
                                        <p className="text-xl text-white/70">Start your journey</p>
                                    </div>
                                    <form onSubmit={handleEmailSubmit}>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-transparent"
                                                required
                                            />
                                            <button type="submit" className="absolute right-1.5 top-1.5 text-white w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                                                →
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* HANDLE STEP */}
                            {step === "handle" && (
                                <motion.div
                                    key="handle"
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="space-y-6 text-center"
                                >
                                    <div className="space-y-1">
                                        <h1 className="text-4xl font-bold text-white">Choose Handle</h1>
                                        <p className="text-xl text-white/70">How should we call you?</p>
                                    </div>
                                    <form onSubmit={handleHandleSubmit}>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="@username"
                                                value={handle}
                                                onChange={(e) => setHandle(e.target.value)}
                                                className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-transparent"
                                                required
                                            />
                                            <button type="button" onClick={handleBack} className="absolute left-1.5 top-1.5 text-white w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                                                ←
                                            </button>
                                            <button type="submit" className="absolute right-1.5 top-1.5 text-white w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                                                →
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* PASSWORD STEP */}
                            {step === "password" && (
                                <motion.div
                                    key="password"
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 100 }}
                                    className="space-y-6 text-center"
                                >
                                    <div className="space-y-1">
                                        <h1 className="text-4xl font-bold text-white">Set Password</h1>
                                        <p className="text-xl text-white/70">Secure your account</p>
                                    </div>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <input
                                            type="password"
                                            placeholder="Min 8 chars"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            minLength={8}
                                            className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-transparent"
                                            required
                                        />
                                        <div className="flex gap-3">
                                            <button type="button" onClick={handleBack} className="rounded-full bg-white/10 text-white px-8 py-3 hover:bg-white/20 w-[30%]">Back</button>
                                            <button type="submit" className="flex-1 rounded-full bg-white text-black font-medium py-3 hover:bg-white/90" disabled={loading}>
                                                {loading ? "Creating..." : "Create Account"}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
